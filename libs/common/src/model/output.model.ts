import { ApiProperty } from '@nestjs/swagger';

import { CustomStatusCode } from '../constant';

export class Output {
  @ApiProperty({
    enum: CustomStatusCode,
    description: 'Custom Status Code',
    nullable: false,
  })
  statusCode!: CustomStatusCode;

  @ApiProperty({ description: 'Message', nullable: true })
  message?: string | null;
}
