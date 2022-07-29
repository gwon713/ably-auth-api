import { DatabaseModule } from '@libs/database';
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule],
})
export class AppModule {}
