import { ApiProperty } from '@nestjs/swagger';

export class TokenInfoModel {
  @ApiProperty({ description: 'token email' })
  email!: string;

  @ApiProperty({ description: 'token grant type' })
  grantType!: string;

  @ApiProperty({ description: 'token expiration unix time' })
  expiration!: number;
}
