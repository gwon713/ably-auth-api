import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

import { StringTransform } from '../transformer';
import { AbstractInput } from './abstract.input';

/**
 * @description
 * @see {IsNotEmpty()} => 필수값
 * @see {IsJWT()} => JWT 형식과 맞는지 확인
 * @see {Length(min,max)} => 최소 길이 min - 최대 길이 max 지정
 * @see {IsString()} => string 값인지 확인
 * @see {StringTransform()} => string 앞뒤 공백 제거 trim()
 */
export class RefreshAccessTokenInput extends AbstractInput {
  @ApiProperty({ description: 'Refresh JWT Token' })
  @IsJWT()
  @IsNotEmpty()
  @IsString()
  @StringTransform()
  refreshToken!: string;
}
