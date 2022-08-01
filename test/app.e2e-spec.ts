import {
  CustomStatusCode,
  Environment,
  VerificationType,
} from '@libs/common/constant';
import {
  RequestVerificationCodeInput,
  ResetUserPasswordInput,
  SignInUserInput,
  SignUpUserInput,
  VerifyVerificationCodeInput,
} from '@libs/common/dto';
import {
  AuthenticationModel,
  TokenInfoModel,
  UserProfileModel,
  VerificationCodeModel,
} from '@libs/common/model';
import { BaseUserEntity } from '@libs/database/entity';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';
import { DataSource, QueryRunner } from 'typeorm';

import { AppModule } from '../app/app.module';
import { Output } from '../libs/common/src/model/output.model';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let queryRunner: QueryRunner;

  let user1_verificationCode: string; // 인증코드 저장
  // mock user 1
  const user1 = {
    email: 'DogKing@naver.com',
    phoneNumber: '010-2610-7014',
    nickName: 'Dog',
    name: '강아지',
    password: 'asdf1234',
  } as BaseUserEntity;

  let user1_accessToken: string;
  let user1_refreshToken: string;

  const user1_newPassword = 'qwer1234';

  // mock user 2
  const user2 = {
    email: 'CatKing@naver.com',
    phoneNumber: '010-2610-7015',
    nickName: 'Cat',
    name: '고양이',
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
    const dbConnection = testingModule.get(DataSource);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryRunner = dbConnection.createQueryRunner('master');

    app = testingModule
      .createNestApplication()
      .useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await queryRunner.dropTable('base_user');
    app.close();
  });

  describe('1 - 회원가입을 테스트한다', () => {
    describe('1. 가입된 유저가 없는 휴대폰으로 인증코드 발급 및 인증을 테스트한다', () => {
      it('POST /auth/request/code 201 회원가입을 위해 휴대폰번호로 인증번호 발급 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/request/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
          } as RequestVerificationCodeInput);

        const resBody: VerificationCodeModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.verificationType).toBe(VerificationType.SignUp);
        user1_verificationCode = resBody.verificationCode;
      });

      it(`POST /auth/verify/code 401 CODE_MISMATCH 발급받은 인증번호가 아닌 것으로 인증을 실패한다`, async () => {
        const testVerificationCode = Math.random()
          .toString()
          .split('.')[1]
          .substring(0, 6);
        console.debug(testVerificationCode);
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: testVerificationCode,
          } as VerifyVerificationCodeInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(resBody.message).toBe(CustomStatusCode.CODE_MISMATCH);
      });

      it('POST /auth/verify/code 201 발급받은 안중번호로 인증을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.SignUp,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
          } as VerifyVerificationCodeInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.statusCode).toBe(CustomStatusCode.SUCCESS);
      });
    });

    describe('2. User1의 회원가입을 테스트한다', () => {
      it('POST /user/signup 201 User1의 회원가입을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/user/signup')
          .send({
            email: user1.email,
            nickName: user1.nickName,
            password: user1.password,
            passwordConfirm: user1.password,
            name: user1.name,
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
          } as SignUpUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(res.body.statusCode).toBe(CustomStatusCode.SUCCESS);
      });
    });

    describe('3. 회원가입 중복 실패를 테스트한다', () => {
      it('POST /user/signup 409 User1의 중복 이메일로 가입요청. 회원가입을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/user/signup')
          .send({
            email: user1.email,
            nickName: user1.nickName,
            password: user1.password,
            passwordConfirm: user1.password,
            name: user1.name,
            phoneNumber: user2.phoneNumber,
            verificationCode: user1_verificationCode,
          } as SignUpUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CONFLICT);
        expect(res.body.message).toBe(CustomStatusCode.DUPLICATE_USER_EMAIL);
      });

      it('POST /user/signup 409 User1의 중복 휴대폰번호로 가입요청. 회원가입을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/user/signup')
          .send({
            email: user2.email,
            nickName: user1.nickName,
            password: user1.password,
            passwordConfirm: user1.password,
            name: user1.name,
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
          } as SignUpUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CONFLICT);
        expect(res.body.message).toBe(
          CustomStatusCode.DUPLICATE_USER_PHONE_NUMBER,
        );
      });
    });
  });

  describe('2 - 로그인을 테스트한다', () => {
    describe('1. 가입된 User1의 로그인 성공을 테스트한다', () => {
      it('POST /auth/signin 201 User1의 이메일로 로그인을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: user1.email,
            password: user1.password,
          } as SignInUserInput);

        const resBody: AuthenticationModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.accessToken).toBeDefined();
        expect(resBody.expiration).toBeDefined();
        expect(resBody.refreshToken).toBeDefined();
        expect(resBody.refreshTokenExpiration).toBeDefined();
        expect(resBody.tokenType).toBe('Bearer');

        user1_accessToken = resBody.accessToken;
        user1_refreshToken = resBody.refreshToken;
      });

      it('POST /auth/signin 201 User1의 휴대폰번호로 로그인을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            phoneNumber: user1.phoneNumber,
            password: user1.password,
          } as SignInUserInput);

        const resBody: AuthenticationModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.accessToken).toBeDefined();
        expect(resBody.expiration).toBeDefined();
        expect(resBody.refreshToken).toBeDefined();
        expect(resBody.refreshTokenExpiration).toBeDefined();
        expect(resBody.tokenType).toBe('Bearer');

        user1_accessToken = resBody.accessToken;
        user1_refreshToken = resBody.refreshToken;
      });
    });

    describe('1. 가입된 User1의 로그인 실패를 테스트한다', () => {
      it('POST /auth/signin 401 User1의 이메일로 잘못된 비밀번호를 입력해 로그인을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: user1.email,
            password: user2.password,
          } as SignInUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(res.body.message).toBe(CustomStatusCode.PASSWORD_INCORRECT);
      });

      it('POST /auth/signin 401 User1의 휴대폰번호로 잘못된 비밀번호를 입력해 로그인을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            phoneNumber: user1.phoneNumber,
            password: user2.password,
          } as SignInUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(res.body.message).toBe(CustomStatusCode.PASSWORD_INCORRECT);
      });
    });

    describe('2. 미가입 User2의 로그인을 테스트한다', () => {
      it('POST /auth/signin 404 미가입 User2의 이메일로 로그인을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: user2.email,
            password: user2.password,
          } as SignInUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
        expect(res.body.message).toBe(CustomStatusCode.USER_NOT_FOUND);
      });

      it('POST /auth/signin 404 미가입 User2의 휴대폰번호로 로그인을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            phoneNumber: user2.phoneNumber,
            password: user2.password,
          } as SignInUserInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
        expect(res.body.message).toBe(CustomStatusCode.USER_NOT_FOUND);
      });
    });
  });

  describe('3 - Token을 테스트한다', () => {
    describe('1. User1의 Token을 사용하여 테스트한다.', () => {
      it('GET /auth/token-info 200 User1의 AccessToken 정보 확인 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .get('/auth/token-info')
          .set('Authorization', 'Bearer ' + user1_accessToken);

        const resBody: TokenInfoModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.OK);
        expect(resBody.email).toBe(user1.email);
        expect(resBody.grantType).toBe('access-token');
      });

      it('GET /auth/token-info 200 User1의 RefreshToken 정보 확인 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .get('/auth/token-info')
          .set('Authorization', 'Bearer ' + user1_refreshToken);

        const resBody: TokenInfoModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.OK);
        expect(resBody.email).toBe(user1.email);
        expect(resBody.grantType).toBe('refresh-token');
      });

      it('GET /auth/token-info 401 Token을 담지않고 요청을 실패한다', async () => {
        const res = await request(app.getHttpServer()).get('/auth/token-info');

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('4 - 내정보 보기를 테스트한다', () => {
    describe('1. User1의 Token을 사용하여 내 정보 보기 요청을 테스트한다.', () => {
      it('POST /user/my-profile 200 User1의 내 정보 보기 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .get('/user/my-profile')
          .set('Authorization', 'Bearer ' + user1_accessToken);

        const resBody: UserProfileModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.OK);
        expect(resBody.email).toBe(user1.email);
        expect(resBody.name).toBe(user1.name);
        expect(resBody.nickName).toBe(user1.nickName);
        expect(resBody.phoneNumber).toBe(user1.phoneNumber.replace(/-/g, ''));
        expect(resBody.lastLoginAt).toBeDefined();
        expect(resBody.lastLogoutAt).toBeDefined();
      });
    });
  });

  describe('5 - 비밀번호 찾기(재설정)를 테스트한다', () => {
    describe('1. 휴대폰번호로 비밀번호 찾기 인증번호를 발급 및 인증한다', () => {
      it('POST /auth/request/code 201 비밀번호 찾기를 위해 User1 휴대폰번호로 인증번호 발급 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/request/code')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user1.phoneNumber,
          } as RequestVerificationCodeInput);

        const resBody: VerificationCodeModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.verificationType).toBe(VerificationType.ResetPassword);
        user1_verificationCode = resBody.verificationCode;
      });

      it('POST /auth/request/code 409 CONFLICT 미가입 User2 휴대폰번호로 인증번호 발급 요청을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/request/code')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user2.phoneNumber,
          } as RequestVerificationCodeInput);

        const resBody: VerificationCodeModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
      });

      it('POST /auth/verify/code 201 비밀번호 찾기를 안중번호로 인증을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/verify/code')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
          } as VerifyVerificationCodeInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.statusCode).toBe(CustomStatusCode.SUCCESS);
      });
    });

    describe('2. 비밀번호 재설정을 테스트한다', () => {
      it('PUT /user/password 404 미가입 User2으로 비밀번호 재설정 요청을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .put('/user/password')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user2.phoneNumber,
            verificationCode: '123456',
            password: user2.password,
            passwordConfirm: user2.password,
          } as ResetUserPasswordInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.NOT_FOUND);
        expect(resBody.message).toBe(CustomStatusCode.USER_NOT_FOUND);
      });

      it('PUT /user/password 409 User1의 기존 비밀번호를 입력해서 재설정 요청을 실패한다', async () => {
        const res = await request(app.getHttpServer())
          .put('/user/password')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
            password: user1.password,
            passwordConfirm: user1.password,
          } as ResetUserPasswordInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CONFLICT);
        expect(resBody.message).toBe(CustomStatusCode.DUPLICATE_USER_PASSWORD);
      });

      it('PUT /user/password 200 User1의 비밀번호를 새로운 비밀번호로 재설정 요청을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .put('/user/password')
          .query({
            verificationType: VerificationType.ResetPassword,
          })
          .send({
            phoneNumber: user1.phoneNumber,
            verificationCode: user1_verificationCode,
            password: user1_newPassword,
            passwordConfirm: user1_newPassword,
          } as ResetUserPasswordInput);

        const resBody: Output = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.OK);
        expect(resBody.statusCode).toBe(CustomStatusCode.SUCCESS);
      });

      it('POST /auth/signin 201 User1의 변경된 비밀번호로 로그인을 성공한다', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            phoneNumber: user1.phoneNumber,
            password: user1_newPassword,
          } as SignInUserInput);

        const resBody: AuthenticationModel = res.body;
        console.debug(resBody);

        expect(res.status).toBe(HttpStatus.CREATED);
        expect(resBody.accessToken).toBeDefined();
        expect(resBody.expiration).toBeDefined();
        expect(resBody.refreshToken).toBeDefined();
        expect(resBody.refreshTokenExpiration).toBeDefined();
        expect(resBody.tokenType).toBe('Bearer');

        user1_accessToken = resBody.accessToken;
        user1_refreshToken = resBody.refreshToken;
      });
    });
  });

  describe('ETC 테스트', () => {
    it('POST /auth/request/code 404 회원가입 인증을 이미 가입된 User1 휴대폰번호로 인증번호 발급해 요청을 실패한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/request/code')
        .query({
          verificationType: VerificationType.SignUp,
        })
        .send({
          phoneNumber: user1.phoneNumber,
        } as RequestVerificationCodeInput);

      const resBody: Output = res.body;
      console.debug(resBody);

      expect(res.status).toBe(HttpStatus.CONFLICT);
      expect(resBody.message).toBe(
        CustomStatusCode.DUPLICATE_USER_PHONE_NUMBER,
      );
    });

    it('POST /auth/signin 400 비밀번호만 입력해서 요청을 실패한다', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          password: user1_newPassword,
        } as SignInUserInput);

      const resBody: Output = res.body;
      console.debug(resBody);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(resBody.message).toBe(CustomStatusCode.PARAMETER_ERROR);
    });
  });
});
