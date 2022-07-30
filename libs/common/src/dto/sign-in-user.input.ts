import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { StringTransform } from '../transformer';
import { AbstractInput } from './abstract.input';

/**
 * @description
 * @see {IsNotEmpty()} => 필수값
 * @see {IsOptional()} => 선택값
 * @see {Length(min,max)} => 최소 길이 min - 최대 길이 max 지정
 * @see {IsString()} => string 값인지 확인
 * @see {IsEmail()} => 이메일 값인지 확인
 * @see {StringTransform()} => string 앞뒤 공백 제거 trim()
 * @see {IsMobilePhone([locale])} => locale array string, 지역에 일치하는 휴대전화 규칙 확인
 * @see {Transform(TransformFnParams)} => TransformFnParams의 해당하는 값으로 변경 * 휴대전화 하이픈 제거
 */

export class SignInUserInput extends AbstractInput {
  @ApiProperty({ description: 'Sign In User Email', nullable: false })
  @IsOptional()
  @Length(6, 320)
  @IsString()
  @IsEmail()
  @StringTransform()
  email!: string;

  @ApiProperty({ description: 'Sign In User PhoneNumber', nullable: false })
  @IsOptional()
  @IsMobilePhone('ko-KR')
  @StringTransform()
  @Transform((phoneNumber) => phoneNumber.value.replace(/-/g, ''))
  phoneNumber!: string;

  @ApiProperty({
    description: 'Sign In User Password Between 8-16',
    nullable: false,
  })
  @Length(8, 16)
  @IsNotEmpty()
  @IsString()
  @StringTransform()
  password!: string;
}
