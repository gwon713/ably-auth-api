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
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
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
  @Get('/token_info')
  @ApiOperation({ summary: '토큰 정보 확인' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: '토큰 정보 확인',
    type: () => TokenInfoModel,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  getTokenInfo(@CurrentUser() user: JwtPayload): Promise<TokenInfoModel> {
    Logger.debug(user);
    try {
      return this.authServive.getTokenInfo(user);
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
    description: '잘못된 패스워드 입력',
  })
  @ApiNotFoundResponse({
    description: '가입된 유저 찾기 실패',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiBody({
    type: () => SignInUserInput,
  })
  signInUserByEmail(
    @Body() input: SignInUserInput,
  ): Promise<AuthenticationModel> {
    Logger.log(input);
    try {
      return this.authServive.authenticate(input);
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
  @ApiOperation({ description: '토큰 갱신' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: '갱신 성공',
    type: () => AuthenticationModel,
  })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  refreshAccessToken(
    @Body() input: RefreshAccessTokenInput,
  ): Promise<AuthenticationModel> {
    Logger.log(input);
    try {
      return this.authServive.refreshAccessToken(input);
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
