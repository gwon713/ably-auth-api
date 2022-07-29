import { Module } from '@nestjs/common';
import { UserModule } from 'app/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StrategyModule } from './strategy';

@Module({
  imports: [StrategyModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
