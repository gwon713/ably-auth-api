import { CustomConfigModule } from '@libs/common/config/config.module';
import { CustomConfigService } from '@libs/common/config/config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DBNamingStrategy } from './db-naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (
        config: CustomConfigService,
      ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions =>
        ({
          type: 'postgres',
          host: config.dbHost,
          port: config.dbPort,
          username: config.dbUsername,
          password: config.dbPassword,
          database: config.dbDatabase,
          schema: config.dbSchema,
          autoLoadEntities: true,
          migrations: [],
          subscribers: [],
          synchronize: config.dbSync,
          logging: config.dbDebug,
          namingStrategy: new DBNamingStrategy(),
          keepConnectionAlive: true,
          dropSchema: false,
        } as TypeOrmModuleOptions),
      inject: [CustomConfigService],
    }),
  ],
})
export class DatabaseModule {}
