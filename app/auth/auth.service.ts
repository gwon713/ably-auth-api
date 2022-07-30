import { CustomConfigService } from '@libs/common/config/config.service';
import { CustomStatusCode } from '@libs/common/constant';
import { RefreshAccessTokenInput, SignInUserInput } from '@libs/common/dto';
import { JwtPayload } from '@libs/common/interface';
import { AuthenticationModel, TokenInfoModel } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'app/user/user.service';
import * as argon2 from 'argon2';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: CustomConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

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
        HttpStatus.BAD_REQUEST,
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
}
