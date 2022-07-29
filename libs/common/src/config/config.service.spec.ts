import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';

import { Environment } from '../constant';
import { CustomConfigService } from './config.service';

describe('ConfigService', () => {
  let service: CustomConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: [join(__dirname, '../env/', `${Environment.TEST}.env`)],
        }),
      ],
      providers: [CustomConfigService],
    }).compile();

    service = module.get<CustomConfigService>(CustomConfigService);
  });

  it('config service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('config 설정된 리스트', () => {
    console.log(expect.getState().currentTestName);
    console.log(Object.getOwnPropertyNames(CustomConfigService.prototype));
  });

  test(`node env 가져오기`, () => {
    expect(service.nodeEnv).toBeDefined();
    expect(
      [
        Environment.DEVELOPMENT,
        Environment.PRODUCTION,
        Environment.TEST,
      ].includes(service.nodeEnv),
    ).toBe(true);
  });

  test(`appPort 가져오기`, () => {
    expect(service.appPort).toBeDefined();
  });

  test(`loglevel 가져오기`, () => {
    expect(service.logLevel).toBeDefined();
    expect(
      ['log', 'error', 'warn', 'debug', 'verbose'].includes(service.logLevel),
    ).toBe(true);
  });

  test(`dbHost 가져오기`, () => {
    expect(service.dbHost).toBeDefined();
  });

  test(`dbPort 가져오기`, () => {
    expect(service.dbPort).toBeDefined();
  });

  test(`dbUsername 가져오기`, () => {
    expect(service.dbUsername).toBeDefined();
  });

  test(`dbPassword 가져오기`, () => {
    expect(service.dbPassword).toBeDefined();
  });

  test(`dbDatabase 가져오기`, () => {
    expect(service.dbDatabase).toBeDefined();
  });

  test(`dbSchema 가져오기`, () => {
    expect(service.dbSchema).toBeDefined();
  });

  test(`dbSync 가져오기`, () => {
    expect(service.dbSync).toBeDefined();
  });

  test(`dbDebug 가져오기`, () => {
    if (typeof service.dbDebug == 'string') {
      expect(
        [
          'all',
          'query',
          'schema',
          'error',
          'warn',
          'info',
          'log',
          'migration',
        ].includes(service.dbDebug),
      ).toBe(true);
    }
    expect(service.dbDebug).toBeDefined();
  });
});
