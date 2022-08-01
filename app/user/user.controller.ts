import { CustomStatusCode } from '@libs/common/constant';
import { CurrentUser } from '@libs/common/decorator';
import { ResetUserPasswordInput, SignUpUserInput } from '@libs/common/dto';
import { JwtAuthGuard } from '@libs/common/guard';
import { CurrentUserInfo } from '@libs/common/interface';
import { Output, UserProfileModel } from '@libs/common/model';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DataSource, QueryRunner } from 'typeorm';

import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userServive: UserService,
    private dataSource: DataSource,
  ) {}

  /**
   *
   * @param input: @see {CurrentUserInfo}
   * @returns {Promise<UserProfileModel>}
   */
  @Get('/my-profile')
  @ApiOperation({ summary: '내 정보 보기' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: '회원가입 성공',
    type: () => UserProfileModel,
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiNotFoundResponse({
    description: '가입된 유저 찾기 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  async getMyProfile(
    @CurrentUser() user: CurrentUserInfo,
  ): Promise<UserProfileModel> {
    Logger.debug(this.getMyProfile.name);
    Logger.debug(user);
    try {
      return await this.userServive.getUserProfile(user);
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        CustomStatusCode.ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   *
   * @param input: @see {SignUpUserInput}
   * @returns {Promise<Output>}
   */
  @Post('/signup')
  @ApiOperation({ summary: '유저 회원가입' })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: () => Output,
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiConflictResponse({
    description: '중복된 계정 회원가입 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러 회원가입 실패',
  })
  async signUpUser(@Body() input: SignUpUserInput): Promise<Output> {
    Logger.debug(this.signUpUser.name);
    Logger.debug(input);

    /**
     * @description
     * Transaction 적용시킬 connection 생성 후 service에 connection 전달 후 사용
     * Err => service 로직 실패하면 Transaction RollBack
     * Finally => 사용한 Connection 반환
     */
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.userServive.signUpUser(
        input,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      Logger.error(error);
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        CustomStatusCode.ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   *
   * @param input: @see {SignUpUserInput}
   * @returns {Promise<Output>}
   */
  @Put('/password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiOkResponse({
    description: '비밀번호 재설정 성공',
    type: () => Output,
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiNotFoundResponse({
    description: '가입된 유저 찾기 실패',
  })
  @ApiConflictResponse({
    description: '이전 비밀번호 입력 재설정 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러 비밀번호 재설정 실패',
  })
  async resetUserPassword(
    @Body() input: ResetUserPasswordInput,
  ): Promise<Output> {
    Logger.debug(this.resetUserPassword.name);
    Logger.debug(input);

    /**
     * @description
     * Transaction 적용시킬 connection 생성 후 service에 connection 전달 후 사용
     * Err => service 로직 실패하면 Transaction RollBack
     * Finally => 사용한 Connection 반환
     */
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.userServive.resetUserPassword(
        input,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      Logger.error(error);
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        CustomStatusCode.ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
