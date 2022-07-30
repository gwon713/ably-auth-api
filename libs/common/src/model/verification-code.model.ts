import { ApiProperty } from '@nestjs/swagger';

import { VerificationType } from '../constant';

export class VerificationCodeModel {
  @ApiProperty({ description: 'Verification Code', nullable: false })
  verificationCode!: string;

  @ApiProperty({
    description: 'Verification Type',
    enum: VerificationType,
    nullable: false,
  })
  verificationType!: VerificationType;
}
