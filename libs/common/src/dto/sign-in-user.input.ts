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

export class SignInUserInput extends AbstractInput {
  @ApiProperty({ description: 'Sign In User Email' })
  @IsOptional()
  @Length(6, 320)
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Sign In User PhoneNumber' })
  @IsOptional()
  @IsMobilePhone()
  @StringTransform()
  phoneNumber?: string;

  @ApiProperty({ description: 'Sign In User Password' })
  @Length(8, 16)
  @IsNotEmpty()
  @IsString()
  password!: string;
}
