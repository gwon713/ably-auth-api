import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '.';

/**
 * @entity
 * @see BaseUserEntity
 * @extends AbstractTimeEntity
 */
@Entity('base_user')
export class BaseUserEntity extends AbstractEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    length: 320,
    nullable: false,
    comment: 'user email',
  })
  email!: string;

  @Column({
    name: 'nick_name',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'nick name',
  })
  nickName!: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'user password',
  })
  password!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'user password',
  })
  phoneNumber!: string;

  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'last login time',
  })
  lastLoginAt?: Date | null;

  @Column({
    name: 'last_logout_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'last logout time',
  })
  lastLogoutAt?: Date | null;
}
