import { CustomConfigService } from '@libs/common/config/config.service';
import { CustomStatusCode } from '@libs/common/constant';
import { RefreshAccessTokenInput, SignInUserInput } from '@libs/common/dto';
import { JwtPayload } from '@libs/common/interface';
import { AuthenticationModel, TokenInfoModel } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'app/user/user.service';
import * as dayjs from 'dayjs';
import e from 'express';

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

    if (user.password != input.password) {
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
    await this.userService.updateOneBaseUserLoginTime(
      user.email,
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
    const user: JwtPayload = this.jwtService.verify(
      input.refreshToken,
    ) as JwtPayload;

    const now: dayjs.Dayjs = dayjs();
    const accessTokenExp: dayjs.Dayjs = now.add(
      this.configService.accessTokenExprieTimeValue,
      this.configService.accessTokenExpireTimeUnit,
    );

    const refreshTokenExp = now.add(
      this.configService.refreshTokenExprieTimeValue,
      this.configService.refreshTokenExpireTimeUnit,
    );
    await this.userService.updateOneBaseUserLoginTime(
      user.aud,
      now,
      accessTokenExp,
    );

    return {
      accessToken: await this.createAccessToken(user.aud, now, accessTokenExp),
      tokenType: 'Bearer',
      expiration: accessTokenExp.unix(),
      refreshToken: await this.createRefreshToken(
        user.aud,
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

  async getTokenInfo(user: JwtPayload): Promise<TokenInfoModel> {
    return {
      email: user.aud,
      grantType: user.sub,
      expiration: user.exp,
    } as TokenInfoModel;
  }
}
