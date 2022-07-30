import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationModel {
  @ApiProperty({ description: 'Access Token', nullable: false })
  accessToken!: string;

  @ApiProperty({ description: 'Token Type', nullable: false })
  tokenType!: string;

  @ApiProperty({
    description: 'Access Token Expiration unixtime',
    nullable: false,
  })
  expiration!: number;

  @ApiProperty({ description: 'Refresh Token', nullable: false })
  refreshToken!: string;

  @ApiProperty({
    description: 'Refresh Token Expiration unixtime',
    nullable: false,
  })
  refreshTokenExpiration!: number;
}
