import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { StringTransform } from '../transformer';
import { AbstractInput } from './abstract.input';

/**
 * @TODO add validation
 */
export class SignUpUserInput extends AbstractInput {
  @ApiProperty({ description: 'SignUp User Email' })
  @IsNotEmpty()
  @Length(6, 320)
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'SignUp User Password' })
  @Length(8, 16)
  @IsNotEmpty()
  @IsString()
  password!: string;

  /**
   * @TODO add Length Validation
   */
  @ApiProperty({ description: 'SignUp User NickName' })
  @IsNotEmpty()
  @IsString()
  nickName!: string;

  @ApiProperty({ description: 'SignUp User phoneNumber' })
  @IsOptional()
  @IsMobilePhone()
  @StringTransform()
  phoneNumber!: string;
}
