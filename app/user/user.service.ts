import {
  CustomStatusCode,
  PHONE_VERIFICATION_CODE_PREFIX,
  VerificationType,
} from '@libs/common/constant';
import { ResetUserPasswordInput, SignUpUserInput } from '@libs/common/dto';
import { CurrentUserInfo } from '@libs/common/interface';
import { Output, UserProfileModel } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(BaseUserEntity)
    private baseUserRepo: Repository<BaseUserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  findOneBaseUserByEmail(email: string): Promise<BaseUserEntity> {
    return this.baseUserRepo.findOne({
      where: {
        email: email,
      },
    });
  }

  findOneBaseUserByPhoneNumber(phoneNumber: string): Promise<BaseUserEntity> {
    return this.baseUserRepo.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    });
  }

  updateOneBaseUserLoginTimeById(
    id: string,
    now: dayjs.Dayjs,
    exp: dayjs.Dayjs,
  ): Promise<UpdateResult> {
    return this.baseUserRepo.update(
      { id: id },
      {
        lastLoginAt: now.toDate(),
        lastLogoutAt: exp.toDate(),
      },
    );
  }

  async getUserProfile(input: CurrentUserInfo): Promise<UserProfileModel> {
    /**
     * @description 등록된 유저인지 확인
     * 등록된 유저가 아니면 Not Found return
     */
    const user = await this.findOneBaseUserByEmail(input.aud);

    if (!user) {
      throw new HttpException(
        CustomStatusCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      email: user.email,
      nickName: user.nickName,
      name: user.name,
      phoneNumber: user.phoneNumber,
      lastLoginAt: user.lastLoginAt,
      lastLogoutAt: user.lastLogoutAt,
    } as UserProfileModel;
  }

  async signUpUser(input: SignUpUserInput): Promise<Output> {
    /**
     * @description 이메일 중복유저 확인
     * 중복 유저이면 Conflict return
     */
    const userByEmail: BaseUserEntity = await this.findOneBaseUserByEmail(
      input.email,
    );

    if (userByEmail != null) {
      throw new HttpException(
        CustomStatusCode.DUPLICATE_USER_EMAIL,
        HttpStatus.CONFLICT,
      );
    }

    /**
     * @description 휴대폰번호 중복유저 확인
     * 중복 유저이면 Conflict return
     */
    const userByPhoneNumber: BaseUserEntity =
      await this.findOneBaseUserByPhoneNumber(input.phoneNumber);

    if (userByPhoneNumber != null) {
      throw new HttpException(
        CustomStatusCode.DUPLICATE_USER_PHONE_NUMBER,
        HttpStatus.CONFLICT,
      );
    }

    /**
     * @description 회원가입으로 인증된 휴대폰번호인지 확인
     * 인증 정보가 없거나 Verification Code가 맞지 않으면 UnAuthorized return
     */
    const prefix =
      PHONE_VERIFICATION_CODE_PREFIX +
      VerificationType.SignUp +
      '_' +
      input.phoneNumber;
    const code = await this.cacheManager.get(prefix);

    Logger.debug(prefix);
    Logger.debug('verify code: ' + code);

    if (!code) {
      throw new HttpException(
        CustomStatusCode.VERIFICATION_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (code != input.verificationCode) {
      throw new HttpException(
        CustomStatusCode.CODE_MISMATCH,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.baseUserRepo.save(
      this.baseUserRepo.create({
        email: input.email,
        nickName: input.nickName,
        password: await argon2.hash(input.password),
        name: input.name,
        phoneNumber: input.phoneNumber,
      }),
    );

    return {
      statusCode: CustomStatusCode.SUCCESS,
      message: '회원가입 성공',
    } as Output;
  }

  async resetUserPassword(input: ResetUserPasswordInput): Promise<Output> {
    /**
     * @description 등록된 유저인지 확인
     * 등록된 유저가 아니면 Not Found return
     */
    const user = await this.findOneBaseUserByPhoneNumber(input.phoneNumber);

    if (!user) {
      throw new HttpException(
        CustomStatusCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    /**
     * @description 비밀번호 재설정으로 인증된 휴대폰번호인지 확인
     * 인증 정보가 없거나 Verification Code가 맞지 않으면 UnAuthorized return
     */
    const prefix =
      PHONE_VERIFICATION_CODE_PREFIX +
      VerificationType.ResetPassword +
      '_' +
      input.phoneNumber;
    const code = await this.cacheManager.get(prefix);

    Logger.debug(prefix);
    Logger.debug('verify code: ' + code);

    if (!code) {
      throw new HttpException(
        CustomStatusCode.VERIFICATION_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (code != input.verificationCode) {
      throw new HttpException(
        CustomStatusCode.CODE_MISMATCH,
        HttpStatus.UNAUTHORIZED,
      );
    }

    /**
     * @description 이전 비밀번호 체크
     * 이전에 설정된 비밀번호와 같으면  Conflict return
     */
    if ((await argon2.verify(user.password, input.password)) === true) {
      throw new HttpException(
        CustomStatusCode.DUPLICATE_USER_PASSWORD,
        HttpStatus.CONFLICT,
      );
    }

    await this.baseUserRepo.update(
      {
        id: user.id,
      },
      { password: await argon2.hash(input.password) },
    );

    return {
      statusCode: CustomStatusCode.SUCCESS,
      message: '비밀번호 재설정 성공',
    } as Output;
  }
}
