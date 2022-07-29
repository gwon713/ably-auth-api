import { CustomConfigModule } from '@libs/common/config/config.module';
import { CustomConfigService } from '@libs/common/config/config.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      useFactory: async (config: CustomConfigService) => ({
        secret: config.jwtSecret,
      }),
      inject: [CustomConfigService],
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class StrategyModule {}
