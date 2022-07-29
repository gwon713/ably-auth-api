import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationModel {
  @ApiProperty({ description: 'access token' })
  accessToken!: string;

  @ApiProperty({ description: 'token type' })
  tokenType!: string;

  @ApiProperty({ description: 'access token expiration unix time' })
  expiration!: number;

  @ApiProperty({ description: 'refresh token' })
  refreshToken!: string;

  @ApiProperty({ description: 'refresh token expiration unix time' })
  refreshTokenExpiration!: number;
}
