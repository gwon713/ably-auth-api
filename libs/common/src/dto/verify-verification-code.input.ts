import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

import { StringTransform } from '../transformer';
import { AbstractInput } from './abstract.input';

/**
 * @description
 * @see {IsNotEmpty()} => 필수값
 * @see {Length(min,max)} => String 최소 길이 min 지정 최대 길이 max 지정
 * @see {IsString()} => string 값인지 확인
 * @see {IsNumberString()} => string number 값인지 확인
 * @see {StringTransform()} => string 앞뒤 공백 제거 trim()
 * @see {IsMobilePhone([locale])} => locale array string, 지역에 일치하는 휴대전화 규칙 확인
 * @see {Transform(TransformFnParams)} => TransformFnParams의 해당하는 값으로 변경 * 휴대전화 하이픈 제거
 */

export class VerifyVerificationCodeInput extends AbstractInput {
  @ApiProperty({
    description: 'Verify Verification PhoneNumber',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('ko-KR')
  @StringTransform()
  @Transform((phoneNumber) => phoneNumber.value.replace(/-/g, ''))
  phoneNumber!: string;

  @ApiProperty({
    description: 'Verification Code',
    nullable: false,
  })
  @IsNotEmpty()
  @Length(6, 6)
  @IsNumberString()
  @StringTransform()
  verificationCode!: string;
}
