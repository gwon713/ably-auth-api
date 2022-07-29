import { CustomStatusCode } from '@libs/common/constant';
import { SignUpUserInput } from '@libs/common/dto';
import { Output } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(BaseUserEntity)
    private baseUserRepo: Repository<BaseUserEntity>,
  ) {}

  async findOneBaseUserByEmail(email: string): Promise<BaseUserEntity> {
    return this.baseUserRepo.findOne({
      where: {
        email: email,
      },
    });
  }

  async findOneBaseUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<BaseUserEntity> {
    return this.baseUserRepo.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    });
  }

  async updateOneBaseUserLoginTime(
    email: string,
    now: dayjs.Dayjs,
    exp: dayjs.Dayjs,
  ): Promise<UpdateResult> {
    return this.baseUserRepo.update(
      { email: email },
      {
        lastLoginAt: now.toDate(),
        lastLogoutAt: exp.toDate(),
      },
    );
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
        CustomStatusCode.DUPLICATE_USER_EMAIL,
        HttpStatus.CONFLICT,
      );
    }

    /**
     * @TODO encrypt password
     */
    await this.baseUserRepo.save(
      this.baseUserRepo.create({
        email: input.email,
        nickName: input.nickName,
        password: input.password,
        phoneNumber: input.phoneNumber,
      }),
    );

    return {
      statusCode: CustomStatusCode.SUCCESS,
      errorMessage: '회원가입 성공',
    };
  }
}
