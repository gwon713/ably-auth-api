import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { SignUpUserInput } from '.';

describe('SignUpUserInput 클래스(회원가입 입력)를 테스트 합니다.', () => {
  it('테스트 수행을 위한 설정이 잘 정의 되어 있습니다.', () => {
    expect(SignUpUserInput).toBeDefined;
  });

  let dto: SignUpUserInput;
  let errors: ValidationError[];

  describe('옳바른 값을 입력한 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: 'DogKing@naver.com',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 발생하지 않습니다.', () => {
      expect(errors.length).toStrictEqual(0);
    });

    it('반환되는 "email" 값은 "DogKing@naver.com" 입니다.', () => {
      expect(dto.email).toStrictEqual('DogKing@naver.com');
    });

    it('반환되는 "phoneNumber" 값은 "01026107014" 입니다.', () => {
      expect(dto.phoneNumber).toStrictEqual('01026107014');
    });

    it('반환되는 "nickName" 값은 "Dog" 입니다.', () => {
      expect(dto.nickName).toStrictEqual('Dog');
    });

    it('반환되는 "name" 값은 "강아지" 입니다.', () => {
      expect(dto.name).toStrictEqual('강아지');
    });

    it('반환되는 "password" 값은 "asdf1234" 입니다.', () => {
      expect(dto.password).toStrictEqual('asdf1234');
    });

    it('반환되는 "passwordConfirm" 값은 "asdf1234" 입니다.', () => {
      expect(dto.passwordConfirm).toStrictEqual('asdf1234');
    });

    it('반환되는 "verificationCode" 값은 "123456" 입니다.', () => {
      expect(dto.verificationCode).toStrictEqual('123456');
    });
  });

  describe('email: 공백(whitespace)이 같이 입력된 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: '   DogKing@naver.com   ',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 발생하지 않습니다.', () => {
      expect(errors.length).toStrictEqual(0);
    });

    it('반환되는 "email" 값은 "DogKing@naver.com" 입니다.', () => {
      expect(dto.email).toStrictEqual('DogKing@naver.com');
    });
  });

  describe('email: 공백(whitespace)만 입력된 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: '  ',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"email should not be empty" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isNotEmpty != null).isNotEmpty,
      ).toStrictEqual('email should not be empty');
    });

    it('"email must be an email" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isEmail != null).isEmail,
      ).toStrictEqual('email must be an email');
    });

    it('"email must be longer than or equal to 6 characters" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isLength != null).isLength,
      ).toStrictEqual('email must be longer than or equal to 6 characters');
    });
  });

  describe('email: null 입력된 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: null,
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"email should not be empty" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isNotEmpty != null).isNotEmpty,
      ).toStrictEqual('email should not be empty');
    });

    it('"email must be a string" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isString != null).isString,
      ).toStrictEqual('email must be a string');
    });

    it('"email must be an email" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isEmail != null).isEmail,
      ).toStrictEqual('email must be an email');
    });

    it('"email must be longer than or equal to 6 characters" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isLength != null).isLength,
      ).toStrictEqual('email must be longer than or equal to 6 characters');
    });
  });

  describe('email: 형식이 맞지 않는 이메일이 입력된 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: 'DogKingnaver.com',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"email must be an email" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isEmail != null).isEmail,
      ).toStrictEqual('email must be an email');
    });
  });

  describe('email: 6글자 미만인 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: 'D@b.c',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"email must be an email" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isEmail != null).isEmail,
      ).toStrictEqual('email must be an email');
    });

    it('"email must be longer than or equal to 6 characters" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isLength != null).isLength,
      ).toStrictEqual('email must be longer than or equal to 6 characters');
    });
  });

  describe('email: 320글자 초과인 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email:
          'p@pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp.p',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"email must be an email" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isEmail != null).isEmail,
      ).toStrictEqual('email must be an email');
    });

    it('"email must be shorter than or equal to 320 characters" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'email')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isLength != null).isLength,
      ).toStrictEqual('email must be shorter than or equal to 320 characters');
    });
  });

  describe('phoneNumber: 다양한 형식의 입력을 테스트합니다.', () => {
    describe('phoneNumber: (-)를 포함한 입력을 테스트합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf1234',
          passwordConfirm: 'asdf1234',
          verificationCode: '123456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 발생하지 않습니다.', () => {
        expect(errors.length).toStrictEqual(0);
      });

      it('반환되는 "phoneNumber" 값은 "01026107014" 입니다.', () => {
        expect(dto.phoneNumber).toStrictEqual('01026107014');
      });
    });

    describe('phoneNumber: (-)가 없는 입력을 테스트합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '01026107014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf1234',
          passwordConfirm: 'asdf1234',
          verificationCode: '123456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 발생하지 않습니다.', () => {
        expect(errors.length).toStrictEqual(0);
      });

      it('반환되는 "phoneNumber" 값은 "01026107014" 입니다.', () => {
        expect(dto.phoneNumber).toStrictEqual('01026107014');
      });
    });
  });

  describe('phoneNumber: 형식이 맞지 않는 전화번호가 입력된 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: 'DogKing@naver.com',
        phoneNumber: '010-2610-70145',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf1234',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"phoneNumber must be a phone number" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'phoneNumber')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.isMobilePhone != null)
          .isMobilePhone,
      ).toStrictEqual('phoneNumber must be a phone number');
    });
  });

  describe('password: 형식이 맞지 않는 비밀번호가 입력된 경우를 테스트 합니다.', () => {
    describe('password: 최소 하나의 문자 및 하나의 숫자가 아닌 경우를 테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'aaaaaaaa',
          passwordConfirm: 'aaaaaaaa',
          verificationCode: '123456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"password Invalid Password Rule" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'password')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.matches != null).matches,
        ).toStrictEqual('Invalid Password Rule');
      });
    });

    describe('password: 8자리 미만의 비밀번호가 입력된 경우를 테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf123',
          passwordConfirm: 'asdf123',
          verificationCode: '123456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"password must be longer than or equal to 8 characters" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'password')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.isLength != null).isLength,
        ).toStrictEqual(
          'password must be longer than or equal to 8 characters',
        );
      });
    });

    describe('password: 16자리 초과의 비밀번호가 입력된 경우를 테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdfghjk123456789',
          passwordConfirm: 'asdfghjk123456789',
          verificationCode: '123456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"password must be shorter than or equal to 16 characters" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'password')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.isLength != null).isLength,
        ).toStrictEqual(
          'password must be shorter than or equal to 16 characters',
        );
      });
    });
  });

  describe('passwordConfirm: password 컬럼의 값과 다른 경우를 테스트 합니다.', () => {
    beforeAll(async () => {
      dto = {
        email: 'DogKing@naver.com',
        phoneNumber: '010-2610-7014',
        nickName: 'Dog',
        name: '강아지',
        password: 'asdf1234',
        passwordConfirm: 'asdf12345',
        verificationCode: '123456',
      } as SignUpUserInput;
      dto = plainToInstance(SignUpUserInput, dto);
      console.log(dto);

      errors = await validate(dto);
    });

    it('에러가 있음을 확인합니다.', () => {
      expect(errors.length).toBeGreaterThan(0);
    });

    it('"Password Confirmation And Password Must Match" 메세지가 표출됩니다.', () => {
      console.debug(JSON.stringify(errors));
      expect(
        errors
          .filter((error) => error.property == 'passwordConfirm')
          .map((error) => error.constraints)
          .find((constraint) => constraint?.Match != null).Match,
      ).toStrictEqual('Password Confirmation And Password Must Match');
    });
  });

  describe('verificationCode: Validate 오류를테스트 합니다.', () => {
    describe('verificationCode: number string의 값이 아닐 때 오류를 테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf1234',
          passwordConfirm: 'asdf1234',
          verificationCode: 'a23456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"verificationCode must be a number string" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'verificationCode')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.isNumberString != null)
            .isNumberString,
        ).toStrictEqual('verificationCode must be a number string');
      });
    });

    describe('verificationCode: 길이가 6미만 일 때 오류를테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf1234',
          passwordConfirm: 'asdf1234',
          verificationCode: '23456',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"verificationCode must be longer than or equal to 6 characters" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'verificationCode')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.isLength != null).isLength,
        ).toStrictEqual(
          'verificationCode must be longer than or equal to 6 characters',
        );
      });
    });

    describe('verificationCode: 길이가 6초과 일 때 오류를테스트 합니다.', () => {
      beforeAll(async () => {
        dto = {
          email: 'DogKing@naver.com',
          phoneNumber: '010-2610-7014',
          nickName: 'Dog',
          name: '강아지',
          password: 'asdf1234',
          passwordConfirm: 'asdf1234',
          verificationCode: '1234567',
        } as SignUpUserInput;
        dto = plainToInstance(SignUpUserInput, dto);
        console.log(dto);

        errors = await validate(dto);
      });

      it('에러가 있음을 확인합니다.', () => {
        expect(errors.length).toBeGreaterThan(0);
      });

      it('"verificationCode must be shorter than or equal to 6 characters" 메세지가 표출됩니다.', () => {
        console.debug(JSON.stringify(errors));
        expect(
          errors
            .filter((error) => error.property == 'verificationCode')
            .map((error) => error.constraints)
            .find((constraint) => constraint?.isLength != null).isLength,
        ).toStrictEqual(
          'verificationCode must be shorter than or equal to 6 characters',
        );
      });
    });
  });
});
