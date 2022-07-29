import { CustomStatusCode } from '@libs/common/constant';
import { SignUpUserInput } from '@libs/common/dto';
import { Output } from '@libs/common/model';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userServive: UserService) {}

  /**
   *
   * @param input: @see {SignUpUserInput}
   * @returns {Promise<Output>}
   * @TODO 전화번호인증 Validation Check ADD
   * @TODO DB Transaction 추가
   */
  @Post('/signup')
  @ApiOperation({ summary: '유저 회원가입' })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: () => Output,
  })
  /**
   *@TODO 전화번호인증 후 Validation 오류
   */
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiConflictResponse({
    description: '중복된 계정 회원가입 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러 회원가입 실패',
  })
  signUpUser(@Body() input: SignUpUserInput): Promise<Output> {
    Logger.debug(input);
    try {
      return this.userServive.signUpUser(input);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        CustomStatusCode.ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
