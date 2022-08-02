import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

import { StringTransform } from '../transformer';
import { AbstractInput } from './abstract.input';

/**
 * @description
 * @see {IsNotEmpty()} => 필수값
 * @see {IsString()} => string 값인지 확인
 * @see {StringTransform()} => string 앞뒤 공백 제거 trim()
 * @see {IsMobilePhone([locale])} => locale array string, 지역에 일치하는 휴대전화 규칙 확인
 * @see {Transform(TransformFnParams)} => TransformFnParams의 해당하는 값으로 변경 * 휴대전화 하이픈 제거
 */

export class GenerateVerificationCodeInput extends AbstractInput {
  @ApiProperty({
    description: 'PhoneNumber for Generate Verification code',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('ko-KR')
  @StringTransform()
  @Transform((phoneNumber) => phoneNumber.value.replace(/-/g, ''))
  phoneNumber!: string;
}
