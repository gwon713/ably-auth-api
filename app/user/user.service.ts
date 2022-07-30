import { CustomStatusCode } from '@libs/common/constant';
import { SignUpUserInput } from '@libs/common/dto';
import { CurrentUserInfo } from '@libs/common/interface';
import { Output, UserProfileModel } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as dayjs from 'dayjs';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(BaseUserEntity)
    private baseUserRepo: Repository<BaseUserEntity>,
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
     */
    const userByPhoneNumber: BaseUserEntity =
      await this.findOneBaseUserByPhoneNumber(input.phoneNumber);

    if (userByPhoneNumber != null) {
      throw new HttpException(
        CustomStatusCode.DUPLICATE_USER_PHONE_NUMBER,
        HttpStatus.CONFLICT,
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
      errorMessage: '회원가입 성공',
    };
  }
}
