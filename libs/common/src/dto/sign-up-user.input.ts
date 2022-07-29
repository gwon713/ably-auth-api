import { ApiProperty } from '@nestjs/swagger';

import { AbstractInput } from './abstract.input';

/**
 * @TODO add validation
 */
export class SignUpUserInput extends AbstractInput {
  @ApiProperty({ description: 'SignUp User Email' })
  email!: string;

  @ApiProperty({ description: 'SignUp User Password' })
  password!: string;

  @ApiProperty({ description: 'SignUp User NickName' })
  nickName!: string;

  @ApiProperty({ description: 'SignUp User phoneNumber' })
  phoneNumber!: string;
}
