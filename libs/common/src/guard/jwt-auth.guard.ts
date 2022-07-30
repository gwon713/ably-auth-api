import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { CustomStatusCode } from '../constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status: any,
  ): any {
    if (info instanceof TokenExpiredError) {
      Logger.error('TokenExpiredError');
      throw new HttpException(
        CustomStatusCode.TOKEN_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (info instanceof JsonWebTokenError || !user) {
      Logger.error('JsonWebTokenError');
      throw new HttpException(
        CustomStatusCode.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      return super.handleRequest(err, user, info, context, status);
    } catch (error) {
      Logger.error(error);
      throw new HttpException(
        CustomStatusCode.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
