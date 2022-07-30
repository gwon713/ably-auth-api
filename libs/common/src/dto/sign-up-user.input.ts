import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import { REGEX_PASSWORD } from '../constant';
import { StringTransform } from '../transformer';
import { Match } from '../validator';
import { AbstractInput } from './abstract.input';

/**
 * @description
 * @see {IsNotEmpty()} => 필수값
 * @see {Length(min,max)} => 최소 길이 min - 최대 길이 max 지정
 * @see {MaxLength(max)} => 최대 길이 max 지정
 * @see {IsString()} => string 값인지 확인
 * @see {IsEmail()} => 이메일 값인지 확인
 * @see {StringTransform()} => string 앞뒤 공백 제거 trim()
 * @see {Matches(REGEX)} => 정규식과 일치한지 확인 => REGEX_PASSWORD 비밀번호 정규식  * 최소 8자 최대 16자리 , 최소 하나의 문자 및 하나의 숫자
 * @see {Match(target)} => target 컬럼과 값이 일치한지 화인 * 비밀번호 확인
 * @see {IsMobilePhone([locale])} => locale array string, 지역에 일치하는 휴대전화 규칙 확인
 * @see {Transform(TransformFnParams)} => TransformFnParams의 해당하는 값으로 변경 * 휴대전화 하이픈 제거
 */
export class SignUpUserInput extends AbstractInput {
  @ApiProperty({ description: 'SignUp User Email', nullable: false })
  @IsNotEmpty()
  @Length(6, 320)
  @IsString()
  @IsEmail()
  @StringTransform()
  email!: string;

  @ApiProperty({ description: 'SignUp User NickName Max 50', nullable: false })
  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  @StringTransform()
  nickName!: string;

  @ApiProperty({
    description:
      'SignUp User Password Between 8-16 최소 하나의 문자 및 하나의 숫자',
    nullable: false,
  })
  @IsNotEmpty()
  @Length(8, 16)
  @IsString()
  @Matches(REGEX_PASSWORD, {
    message: 'Invalid Password Rule',
  })
  @StringTransform()
  password!: string;

  @ApiProperty({
    description: 'SignUp User Password Confirmation',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Match('password', {
    message: 'Password Confirmation And Password Must Match',
  })
  @StringTransform()
  passwordConfirm!: string;

  @ApiProperty({ description: 'SignUp User Name Max 50', nullable: false })
  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  @StringTransform()
  name!: string;

  @ApiProperty({ description: 'SignUp User phoneNumber', nullable: false })
  @IsNotEmpty()
  @IsMobilePhone('ko-KR')
  @StringTransform()
  @Transform((phoneNumber) => phoneNumber.value.replace(/-/g, ''))
  phoneNumber!: string;
}
