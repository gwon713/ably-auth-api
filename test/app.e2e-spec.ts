import { Environment, VerificationType } from '@libs/common/constant';
import {
  RequestVerificationCodeInput,
  VerifyVerificationCodeInput,
} from '@libs/common/dto';
import { VerificationCodeModel } from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

import { AppModule } from '../app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let queryRunner: QueryRunner;

  let verificationCode: string; // 인증코드 저장
  // mock user 1
  const user1 = {
    email: 'julius714@naver.com',
    phoneNumber: '010-2610-7014',
    nickName: 'Loo',
    name: '권민제',
    password: 'asdf1234',
  } as BaseUserEntity;

  // mock user 2
  const user2 = {
    email: 'julius715@naver.com',
    phoneNumber: '010-2610-7015',
    nickName: 'Soo',
    name: '권민제',
    password: 'zxcv1234',
  } as BaseUserEntity;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: [join(__dirname, '../env/', `${Environment.TEST}.env`)],
        }),
        AppModule,
      ],
    }).compile();

    app = testingModule
      .createNestApplication()
      .useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dbConnection = testingModule.get(DataSource);
    const manager = testingModule.get(EntityManager);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryRunner = manager.queryRunner =
      dbConnection.createQueryRunner('master');
  });

  beforeEach(async () => {
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await app.close();
  });

  describe('회원가입 성공케이스', () => {
    describe('가입된 유저가 없는 휴대폰으로 인증코드 발급 및 인증', () => {
      it('POST /auth/request/code 201 회원가입 휴대폰 인증번호 발급을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/request/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
          } as RequestVerificationCodeInput);

        const resBody: VerificationCodeModel = res.body;
        expect(res.status).toBe(201);
        expect(resBody.verificationType).toBe(VerificationType.SignUp);
        verificationCode = res.body.verificationCode;
      });

      it('POST /auth/verify/code 201', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: verificationCode,
          } as VerifyVerificationCodeInput);

        expect(res.status).toBe(201);
      });

      it('POST /auth/verify/code 201 회원가입 휴대폰 인증을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: verificationCode,
          } as VerifyVerificationCodeInput);

        expect(res.status).toBe(201);
      });

      it('POST /user/signup 201 회원가입 휴대폰 인증 성공', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: verificationCode,
          } as VerifyVerificationCodeInput);

        expect(res.status).toBe(201);
      });
    });
  });
});
