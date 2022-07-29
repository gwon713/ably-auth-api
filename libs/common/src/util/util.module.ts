import { Module } from '@nestjs/common';

import { CustomConfigModule } from '../config/config.module';
import { UtilService } from './util.service';

@Module({
  imports: [CustomConfigModule],
  providers: [UtilService],
  exports: [UtilService],
})
export class UtilModule {}
