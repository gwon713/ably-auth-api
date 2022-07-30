/**
 * VerificationType
 *
 * @description 인증 받을 종류
 * @enum {SignUp} => 회원가입시 인증
 * @enum {ResetPassword} => 비밀번호 재설정시 인증
 */
export enum VerificationType {
  SignUp = 'SignUp',
  ResetPassword = 'ResetPassword',
}
