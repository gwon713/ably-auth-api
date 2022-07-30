import { CustomStatusCode } from '@libs/common/constant';
import { CurrentUser } from '@libs/common/decorator';
import { RefreshAccessTokenInput, SignInUserInput } from '@libs/common/dto';
import { JwtAuthGuard } from '@libs/common/guard';
import { JwtPayload } from '@libs/common/interface';
import { AuthenticationModel, TokenInfoModel } from '@libs/common/model';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authServive: AuthService) {}

  /**
   * @TODO add get myProfile
   */

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
    Logger.log(input);
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
    Logger.log(input);
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
