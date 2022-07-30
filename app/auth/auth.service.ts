import { CustomConfigService } from '@libs/common/config/config.service';
import {
  CustomStatusCode,
  PHONE_VERIFICATION_CODE_PREFIX,
  VerificationType,
} from '@libs/common/constant';
import {
  RefreshAccessTokenInput,
  RequestVerificationCodeInput,
  SignInUserInput,
  VerifyVerificationCodeInput,
} from '@libs/common/dto';
import { JwtPayload } from '@libs/common/interface';
import {
  AuthenticationModel,
  Output,
  TokenInfoModel,
  VerificationCodeModel,
} from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'app/user/user.service';
import * as argon2 from 'argon2';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: CustomConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async authenticate(input: SignInUserInput): Promise<AuthenticationModel> {
    let user: BaseUserEntity;

    /**
     * @description
     * 유저를 판별할 수 있는 값인 email 과 phoneNumber으로 유저 조회
     * email과 phoneNumber 둘 중 하나라도 입력되면 유저 조회가능
     * email과 phoneNumber를 둘다 입력했을 때는 우선 순위는 email > phoneNumber 하나라도 조회되면 유저 정보 반환
     */
    if (input['email']) {
      Logger.debug('findOneBaseUserByEmail');
      user = await this.userService.findOneBaseUserByEmail(input.email);
    } else if (input['phoneNumber']) {
      Logger.debug('findOneBaseUserByPhoneNumber');
      user = await this.userService.findOneBaseUserByPhoneNumber(
        input.phoneNumber,
      );
    } else {
      throw new HttpException(
        CustomStatusCode.PARAMETER_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!user) {
      throw new HttpException(
        CustomStatusCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if ((await argon2.verify(user.password, input.password)) === false) {
      throw new HttpException(
        CustomStatusCode.PASSWORD_INCORRECT,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const now: dayjs.Dayjs = dayjs();

    const accessTokenExp: dayjs.Dayjs = now.add(
      this.configService.accessTokenExprieTimeValue,
      this.configService.accessTokenExpireTimeUnit,
    );

    const refreshTokenExp = now.add(
      this.configService.refreshTokenExprieTimeValue,
      this.configService.refreshTokenExpireTimeUnit,
    );

    /**
     * @description
     * Access Token 생성시간 => Login Time
     * Access Token 만료시간 accessTokenExp => LogOut Time
     */
    await this.userService.updateOneBaseUserLoginTimeById(
      user.id,
      now,
      accessTokenExp,
    );

    return {
      accessToken: await this.createAccessToken(
        user.email,
        now,
        accessTokenExp,
      ),
      tokenType: 'Bearer',
      expiration: accessTokenExp.unix(),
      refreshToken: await this.createRefreshToken(
        user.email,
        now,
        refreshTokenExp,
      ),
      refreshTokenExpiration: refreshTokenExp.unix(),
    } as AuthenticationModel;
  }

  async refreshAccessToken(
    input: RefreshAccessTokenInput,
  ): Promise<AuthenticationModel> {
    let payload: JwtPayload;

    /**
     * @description Refresh Token Decrypt
     */
    try {
      payload = this.jwtService.verify(input.refreshToken) as JwtPayload;
    } catch (error) {
      Logger.error(error);
      throw new HttpException(
        CustomStatusCode.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!payload) {
      throw new HttpException(
        CustomStatusCode.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findOneBaseUserByEmail(payload.aud);

    if (!user) {
      throw new HttpException(
        CustomStatusCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const now: dayjs.Dayjs = dayjs();

    const accessTokenExp: dayjs.Dayjs = now.add(
      this.configService.accessTokenExprieTimeValue,
      this.configService.accessTokenExpireTimeUnit,
    );

    const refreshTokenExp = now.add(
      this.configService.refreshTokenExprieTimeValue,
      this.configService.refreshTokenExpireTimeUnit,
    );

    /**
     * @description
     * Access Token 생성시간 => Login Time
     * Access Token 만료시간 => LogOut Time
     */
    await this.userService.updateOneBaseUserLoginTimeById(
      user.id,
      now,
      accessTokenExp,
    );

    return {
      accessToken: await this.createAccessToken(
        user.email,
        now,
        accessTokenExp,
      ),
      tokenType: 'Bearer',
      expiration: accessTokenExp.unix(),
      refreshToken: await this.createRefreshToken(
        user.email,
        now,
        refreshTokenExp,
      ),
      refreshTokenExpiration: refreshTokenExp.unix(),
    } as AuthenticationModel;
  }

  async createAccessToken(
    aud: string,
    now: dayjs.Dayjs,
    exp: dayjs.Dayjs,
  ): Promise<string> {
    const payload = {
      iss: '',
      sub: 'access-token',
      aud: aud,
      iat: now.unix(),
      exp: exp.unix(),
    } as JwtPayload;
    return await this.jwtService.signAsync(payload);
  }

  async createRefreshToken(
    aud: string,
    now: dayjs.Dayjs,
    exp: dayjs.Dayjs,
  ): Promise<string> {
    const payload = {
      iss: '',
      sub: 'refresh-token',
      aud: aud,
      iat: now.unix(),
      exp: exp.unix(),
    } as JwtPayload;
    return await this.jwtService.signAsync(payload);
  }

  async getTokenInfo(payload: JwtPayload): Promise<TokenInfoModel> {
    return {
      email: payload.aud,
      grantType: payload.sub,
      expiration: payload.exp,
    } as TokenInfoModel;
  }

  async createVerificationCode(
    verificationType: VerificationType,
    input: RequestVerificationCodeInput,
  ): Promise<VerificationCodeModel> {
    /**
     * @description
     * 회원가입 휴대폰 인증 진행시 가입된 휴대폰 번호가 있는 지 확인
     * 있으면 Conflict Return
     */
    if (verificationType == VerificationType.SignUp) {
      Logger.debug('SignUp');
      const user = await this.userService.findOneBaseUserByPhoneNumber(
        input.phoneNumber,
      );

      if (user != null) {
        throw new HttpException(
          CustomStatusCode.DUPLICATE_USER_PHONE_NUMBER,
          HttpStatus.CONFLICT,
        );
      }
    }

    /**
     * @description
     * 비밀번호 재설정 휴대폰 인증 진행시 가입된 휴대폰 번호가 있는 지 확인
     * 없으면 Not Found Return
     */
    if (verificationType == VerificationType.ResetPassword) {
      Logger.debug('ResetPassword');
      const user = await this.userService.findOneBaseUserByPhoneNumber(
        input.phoneNumber,
      );

      if (!user) {
        throw new HttpException(
          CustomStatusCode.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    /**
     * @description
     * Verification Code 생성 6자리 난수
     * Varification Type+PhoneNumber, Code Cache Key Value 형태로 저장 * 3분동안 유효
     */
    const code = Math.random().toString().split('.')[1].substring(0, 6);

    const prefix =
      PHONE_VERIFICATION_CODE_PREFIX +
      verificationType +
      '_' +
      input.phoneNumber;
    Logger.debug(prefix);
    Logger.debug('verify code: ' + code);

    await this.cacheManager.set(prefix, code, {
      ttl: 180,
    });

    /**
     * @TODO Send SMS
     */

    /**
     * @description
     * SMS 기능이 구현되있지 않기 때문에 임시로 Varification Code return
     */
    return {
      verificationCode: code,
      verificationType: verificationType,
    } as VerificationCodeModel;
  }

  async verifyVerificationCode(
    verificationType: VerificationType,
    input: VerifyVerificationCodeInput,
  ): Promise<Output> {
    /**
     * @description
     * Verify Code 저장된 Cache Code 정보 가져와서 인증
     */
    const prefix =
      PHONE_VERIFICATION_CODE_PREFIX +
      verificationType +
      '_' +
      input.phoneNumber;

    const code = await this.cacheManager.get(prefix);

    Logger.debug(prefix);
    Logger.debug('verify code: ' + code);

    /**
     * @description
     * Verify Code 저장된 Cache Code 정보 조회
     * 조회가 안되면 Not Found return
     * 코드가 다르면 UnAuthorized return
     */
    if (!code) {
      throw new HttpException(
        CustomStatusCode.VERIFICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (code != input.verificationCode) {
      throw new HttpException(
        CustomStatusCode.CODE_MISMATCH,
        HttpStatus.UNAUTHORIZED,
      );
    }

    /**
     * @description
     * Varification Type+PhoneNumber, Code Cache Key Value 형태로 저장 * 1시간 동안 유효
     * 인증 후 인증코드의 짧은 TTL을 늘려줌
     * UserService에서 인증정보를 사용하기 유리
     */

    await this.cacheManager.set(prefix, code, {
      ttl: 3600,
    });

    return {
      statusCode: CustomStatusCode.SUCCESS,
      message: 'Verification Success',
    } as Output;
  }
}
