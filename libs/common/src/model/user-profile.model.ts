import { ApiProperty } from '@nestjs/swagger';

export class UserProfileModel {
  @ApiProperty({ description: 'User Email', nullable: false })
  email!: string;

  @ApiProperty({ description: 'User NickName', nullable: false })
  nickName!: string;

  @ApiProperty({ description: 'User Name', nullable: false })
  name!: string;

  @ApiProperty({ description: 'User PhoneNumber', nullable: false })
  phoneNumber!: string;

  @ApiProperty({ description: 'User LastLoginAt', nullable: true })
  lastLoginAt?: Date | null;

  @ApiProperty({ description: 'User LastLogoutAt', nullable: true })
  lastLogoutAt?: Date | null;
}
