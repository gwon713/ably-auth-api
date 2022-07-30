import { ApiProperty } from '@nestjs/swagger';

export class TokenInfoModel {
  @ApiProperty({ description: 'Token User Email', nullable: false })
  email!: string;

  @ApiProperty({ description: 'Token GrantType', nullable: false })
  grantType!: string;

  @ApiProperty({ description: 'Token Expiration unixtime', nullable: false })
  expiration!: number;
}
