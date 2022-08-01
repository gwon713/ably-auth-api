import { CustomStatusCode, VerificationType } from '@libs/common/constant';
import { CurrentUser } from '@libs/common/decorator';
import {
  RefreshAccessTokenInput,
  RequestVerificationCodeInput,
  SignInUserInput,
  VerifyVerificationCodeInput,
} from '@libs/common/dto';
import { JwtAuthGuard } from '@libs/common/guard';
import { JwtPayload } from '@libs/common/interface';
import {
  AuthenticationModel,
  Output,
  TokenInfoModel,
  VerificationCodeModel,
} from '@libs/common/model';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authServive: AuthService) {}

  /**
   * @param query: @see {VerifyVerificationCodeInput}
   * @param body: @see {RequestVerificationCodeInput}
   * @returns {Promise<VerificationCodeModel>}
   */
  @Post('/request/code')
  @ApiOperation({ summary: '휴대폰 인증번호 요청' })
  @ApiQuery({ name: 'verificationType', enum: VerificationType })
  @ApiCreatedResponse({
    description: '인증번호 발급 성공',
    type: () => VerificationCodeModel,
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiNotFoundResponse({
    description: '가입된 유저 찾기 실패 (비밀번호 찾기 휴대폰 인증 때)',
  })
  @ApiConflictResponse({
    description: '중복된 계정 회원가입 실패 (회원가입시 휴대폰 인증 때)',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  async requestVerificationCode(
    @Query('verificationType') verificationType: VerificationType,
    @Body() input: RequestVerificationCodeInput,
  ): Promise<VerificationCodeModel> {
    Logger.debug(this.requestVerificationCode.name);
    Logger.debug(verificationType);
    Logger.debug(input);
    try {
      return this.authServive.createVerificationCode(verificationType, input);
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
   * @param body: @see {VerifyVerificationCodeInput}
   * @returns {Promise<Output>}
   */
  @Post('/verify/code')
  @ApiOperation({ summary: '휴대폰 인증번호 인증' })
  @ApiQuery({ name: 'verificationType', enum: VerificationType })
  @ApiOkResponse({
    description: '인증 성공',
    type: () => Output,
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiNotFoundResponse({
    description: '인증번호 발급된 휴대전화 없음',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  async verifyVerificationCode(
    @Query('verificationType') verificationType: VerificationType,
    @Body() input: VerifyVerificationCodeInput,
  ): Promise<Output> {
    Logger.debug(this.verifyVerificationCode.name);
    Logger.debug(verificationType);
    Logger.debug(input);
    try {
      return this.authServive.verifyVerificationCode(verificationType, input);
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
   * @param input: @see {JwtPayload}
   * @returns {Promise<TokenInfoModel>}
   */
  @Get('/token-info')
  @ApiOperation({ summary: '토큰 정보 확인' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: '토큰 정보 확인',
    type: () => TokenInfoModel,
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  async getTokenInfo(
    @CurrentUser() payload: JwtPayload,
  ): Promise<TokenInfoModel> {
    Logger.debug(this.getTokenInfo.name);
    Logger.debug(payload);
    try {
      return await this.authServive.getTokenInfo(payload);
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
   * @param input: @see {SignInUserByEmailInput}
   * @returns {Promise<AuthenticationModel>}
   */
  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({
    description: '로그인 성공',
    type: () => AuthenticationModel,
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
  async signInUserByEmail(
    @Body() input: SignInUserInput,
  ): Promise<AuthenticationModel> {
    Logger.debug(this.signInUserByEmail.name);
    Logger.debug(input);
    try {
      return await this.authServive.authenticate(input);
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
   * @param input: @see {RefreshAccessTokenInput}
   * @returns {Promise<AuthenticationModel>}
   */
  @Post('/token')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({
    description: '갱신 성공',
    type: () => AuthenticationModel,
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  async refreshAccessToken(
    @Body() input: RefreshAccessTokenInput,
  ): Promise<AuthenticationModel> {
    Logger.debug(this.refreshAccessToken.name);
    Logger.debug(input);
    try {
      return await this.authServive.refreshAccessToken(input);
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
}
