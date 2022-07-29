import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

import { AbstractInput } from './abstract.input';

/**
 * @TODO add validation
 */
export class RefreshAccessTokenInput extends AbstractInput {
  @ApiProperty({ description: 'Refresh JWT Token' })
  @IsJWT()
  refreshToken!: string;
}
