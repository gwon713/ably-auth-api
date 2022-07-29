export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  // nbf: number;
  iat: number;
  // jti: string;
}
