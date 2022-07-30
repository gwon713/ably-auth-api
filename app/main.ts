import { CustomConfigService } from '@libs/common/config/config.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupSwagger } from './util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config: CustomConfigService =
    app.get<CustomConfigService>(CustomConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('/api/v1');
  setupSwagger(app);
  Logger.log(`Environment: ${config.nodeEnv}`);
  Logger.log(`app is running on ${config.appPort}`);
  await app.listen(config.appPort);
}
bootstrap();
