import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { CustomStatusCode } from '../constant';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): any => {
    switch (context.getType().toString()) {
      case 'http':
        return context.switchToHttp().getRequest().user;
      default:
        throw new HttpException(CustomStatusCode.ERROR, HttpStatus.BAD_REQUEST);
    }
  },
);
