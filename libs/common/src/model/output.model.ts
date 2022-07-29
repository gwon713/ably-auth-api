import { ApiProperty } from '@nestjs/swagger';

import { CustomStatusCode } from '../constant';

export class Output {
  @ApiProperty({ enum: CustomStatusCode })
  statusCode!: CustomStatusCode;

  @ApiProperty()
  errorMessage?: string | null;
}
