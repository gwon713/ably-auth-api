import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManipulateType } from 'dayjs';
import { LoggerOptions } from 'typeorm';

import { Environment } from '../constant';

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): Environment {
    return this.configService.get<Environment>(
      'NODE_ENV',
      Environment.DEVELOPMENT,
    );
  }

  get logLevel(): LogLevel {
    return this.configService.get<LogLevel>('LOG_LEVEL', <LogLevel>'debug');
  }

  get appPort(): number {
    return this.configService.get<number>('APP_PORT', 3001);
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'postgres');
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT', 5432);
  }

  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME', 'postgres');
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'postgres');
  }

  get dbDatabase(): string {
    return this.configService.get<string>('DB_DATABASE', 'postgres');
  }

  get dbSchema(): string {
    return this.configService.get<string>('DB_SCHEMA', 'public');
  }

  get dbSync(): boolean {
    return this.configService.get<boolean>('DB_SYNC', true);
  }

  get dbDebug(): LoggerOptions {
    return this.configService.get<LoggerOptions>(
      'DB_DEBUG',
      <LoggerOptions>'all',
    );
  }

  get jwtSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'O8jSX9Su4hM8CrDJMbgr1HgAsGMpxYRcnXbVQE6gryw',
    );
  }

  get accessTokenExprieTimeValue(): number {
    return this.configService.get<number>('ACCESS_TOKEN_EXPIRE_TIME_VALUE', 1);
  }

  get accessTokenExpireTimeUnit(): ManipulateType {
    return this.configService.get<ManipulateType>(
      'ACCESS_TOKEN_EXPIRE_TIME_UNIT',
      <ManipulateType>'hour',
    );
  }

  get refreshTokenExprieTimeValue(): number {
    return this.configService.get<number>('REFRESH_TOKEN_EXPIRE_TIME_VALUE', 1);
  }

  get refreshTokenExpireTimeUnit(): ManipulateType {
    return this.configService.get<ManipulateType>(
      'REFRESH_TOKEN_EXPIRE_TIME_UNIT',
      <ManipulateType>'month',
    );
  }
}
