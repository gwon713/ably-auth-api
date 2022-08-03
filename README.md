# Ably Auth API

---

# :hammer: Tools

- ### Lagauge

  <a><img alt="JavaScript" src ="https://img.shields.io/badge/​-JavaScript-F7DF1E.svg?style=flat-square&logo=JavaScript&logoColor=F7DF1E"/></a>
  <a><img alt="TypeScript" src ="https://img.shields.io/badge/​-TypeScript-3178C6.svg?style=flat-square&logo=TypeScript&logoColor=3178C6"/></a>

- ### Framework

  <a><img alt="Nest js" src ="https://img.shields.io/badge/​-Nest js-%23E0234E.svg?style=flat-square&logo=nestjs&logoColor=white"/></a> [Nestjs](https://github.com/nestjs/nest)

- ### DB

  <a><img alt="PostGres" src ="https://img.shields.io/badge/​-PostgreSQL-4169E1.svg?style=flat-square&logo=postgresql&logoColor=white"/></a>

- ### Runtime

  <a><img alt="Node.js" src ="https://img.shields.io/badge/​-Node js 16.15.1-339933.svg?style=flat-square&logo=Node.js&logoColor=white"/></a>

- ### ORM
  [TypeORM](https://github.com/typeorm/typeorm)
- ### Testing

  <a><img alt="Jest" src ="https://img.shields.io/badge/​-jest-C21325.svg?style=flat-square&logo=jest&logoColor=white"/></a> [Jest](https://github.com/facebook/jest)

---

# :rocket: How to run

### - Docker

Docker, Docker Compose

##### :warning: check port 3001, 5432

```bash
./docker.sh development
```

### - Local Nodejs - 16.15.1

##### :warning: Before to Start App. Need to Set Up Postgres DB runs on 5432 port and Set ENV file

```bash
docker-compose up -d postgres
```

```bash
mkdir env
echo DB_HOST=localhost > ./env/development.env
```

```bash
npm ci
npm run start
```

### ❗❗❗

만약 실행이 안된다면 <code><a href="http://gwon-webserver.iptime.org/docs/v1">http://gwon-webserver.iptime.org/docs/v1</a></code> 이 주소로 들어가서 테스트도 가능합니다

---

# :memo: Docs (Swagger)

<code><a href="http://localhost:3001/docs/v1">http://localhost:3001/docs/v1</a></code>

or

- Hosting URL

<code><a href="http://gwon-webserver.iptime.org/docs/v1">http://gwon-webserver.iptime.org/docs/v1</a></code>

---

# :zap: Spec

### 사용자 요구사항

- 이메일 :white_check_mark:
- 닉네임 :white_check_mark:
- 비밀번호 :white_check_mark:
- 이름 :white_check_mark:
- 전화번호 :white_check_mark:

### 기능 요구사항

- 회원가입 기능 :white_check_mark:
  - 전화번호 인증 후 회원가입 :white_check_mark:
- 로그인 기능 :white_check_mark:
  - 식별 가능한 모든 정보로 로그인(unique 값인 이메일, 전화번호로 로그인 가능) :white_check_mark:
- 내 정보 보기 기능 :white_check_mark:
- 비밀번호 찾기 (재설정) 기능 :white_check_mark:
  - 로그인 되어 있지 않은 상태에서 비밀번호 재설정 :white_check_mark:
  - 전화번호 인증 후 비밀번호 재설정 :white_check_mark:

#### ETC

- jwt token정보를 가져오는 API
- refresh token을 통한 jwt token 재발급 API

---

# API

## User

### 내 정보 보기

```
GET - /api/v1/user/my-profile
```

##### - Description

발급 받은 jwt token으로 내 정보를 조회해주는 API

##### - Request

```
header - { "Authorization": "Bearer {jwt token}" }
```

##### - Validation

- jwt validate invalid, expired

##### - Response

```
{
  "email": "string",
  "nickName": "string",
  "name": "string",
  "phoneNumber": "string",
  "lastLoginAt": "2022-08-02T14:09:18.978Z",
  "lastLogoutAt": "2022-08-02T14:09:18.978Z"
}

200 - request header에 Bearer JWT토큰를 포함해 요청을 보내면
JWT 토큰의 aud(email) 값에 해당하는 유저데이터를 조회 후 반환한다
401 - request header에 JWT토큰 값이 없거나, 만료, 허용되지 않은 Token일 경우 반환한다
404 - request header JWT토큰의 aud(email)에 해당하는 유저데이터를 조회할 수 없는 경우 반환한다
```

### 회원가입

```
POST - /api/v1/user/signup
```

##### - Description

발급받은 회원가입 인증코드 인증 및 미가입 유저를 회원가입해주는 API

##### - Request

```
body - {
  "email": "string",
  "nickName": "string",
  "password": "string",
  "passwordConfirm": "string",
  "name": "string",
  "phoneNumber": "string",
  "verificationCode": "string"
}
```

##### - Validation

- email 형식 validate
- password validate
  - 8-16자 사이
  - 하나 이상의 영문과 하나 이상의 숫자조합 형식
- passwordConfirm validate password column과 일치한지 확인
- phoneNumber validate
  - (-) dash 포함해서 입력가능
  - KR Mobile 전화번호 형식 확인

##### - Response

```
{
  "statusCode": "SUCCESS",
  "message": "string"
}

201 - 올바른 입력 값과 미가입된 유저로 회원가입 성공
401 - 해당 전화번호로 활성화된 SignUp Verification Code가 존재하지 않거나
입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다
409 - 입력받은 이메일과 전화번호가 이미 등록된 사용자가 있을 경우 반환한다
```

### 비밀번호 재설정

```
PUT - /api/v1/user/password
```

##### - Description

가입된 유저가 발급받은 비밀번호 재설정 인증코드 인증 및 비밀번호 재설정을해주는 API

##### - Request

```
body - {
  "phoneNumber": "string",
  "verificationCode": "string",
  "password": "string",
  "passwordConfirm": "string"
}
```

##### - Validation

- phoneNumber validate
  - (-) dash 포함해서 입력가능
  - KR Mobile 전화번호 형식 확인
- verificationCode validate
  - 6자리 숫자 String 인지 확인
- password validate
  - 8-16자 사이
  - 하나 이상의 영문과 하나 이상의 숫자조합 형식
- passwordConfirm validate password column과 일치한지 확인

##### - Response

```
{
  "statusCode": "SUCCESS",
  "message": "string"
}

200 - 올바른 입력 값으로 비밀번호 재설정 성공
401 - 해당 전화번호로 활성화된 ResetPassword Verification Code가 존재하지 않거나
입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다
404 - 입력한 전화번호로 유저데이터를 조회할 수 없는 경우 반환한다
409 - 재설정할 password가 기존에 password와 일치할 경우 반환한다
```

## Auth

### 토큰 정보 확인

```
GET - /api/v1/auth/token-info
```

##### - Description

발급받은 토큰의 정보를 해독해주는 API

##### - Request

```
header - { "Authorization": "Bearer {jwt token}" }
```

##### - Validation

- jwt validate invalid, expired

##### - Response

```

{
  "email": "string",
  "grantType": "string", => 해당토큰의 타입 (access, refresh)
  "expiration": 0 => 해당토큰 만료시간 unix time
}

200 - request header에 Bearer JWT토큰를 포함해 요청을 보내면 JWT 토큰 해독 후 반환한다
401 - request header에 JWT토큰 값이 없거나, 만료, 허용되지 않은 Token일 경우 반환한다
```

### 휴대폰 인증번호 요청 (회원가입, 비밀번호 재설정)

```
POST - /api/v1/auth/generate/code?verificationType=""
```

##### - Description

회원가입, 비밀번호 재설정에 필요한 휴대폰 인증코드를 발급해주는 API
:bulb: SMS기능이 구현되어있지않아 code가 반환됨

##### - Request

```
query - {
  "verificationType": enum["SignUp", "ResetPassword"],
}
```

```
body - {
  "phoneNumber": "string",
}
```

##### - Validation

- phoneNumber validate
  - (-) dash 포함해서 입력가능
  - KR Mobile 전화번호 형식 확인

##### - Response

```
{
  "verificationCode": "string",
  "verificationType": "SignUp" or "ResetPassword"
}

201 - 입력한 verificationType과 PhoneNumber에 해당하는 6자리 난수 인증코드를 반환한다
404 - 입력한 전화번호로 유저데이터를 조회할 수 없는 경우 반환한다
409 - 재설정할 password가 기존에 password와 일치할 경우 반환한다
```

### 휴대폰 인증번호 인증 요청

```
POST - /api/v1/auth/verify/code?verificationType=""
```

##### - Description

인증코드를 확인하는 API
:bulb: 인증코드 Cache TTL을 늘려준다

##### - Request

```
query - {
  "verificationType": enum["SignUp", "ResetPassword"],
}
```

```
body -{
  "phoneNumber": "string",
  "verificationCode": "string"
}
```

##### - Validation

- phoneNumber validate
  - (-) dash 포함해서 입력가능
  - KR Mobile 전화번호 형식 확인
- verificationCode validate
  - 6자리 숫자 String 인지 확인

##### - Response

```
{
  "statusCode": "SUCCESS",
  "message": "string"
}

201 - 입력한 verificationType과 PhoneNumber에 해당하는 6자리 난수 인증코드를 반환한다
401 - 입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다 - CODE_MISMATCH
404 - 입력한 전화번호 및 verificationType[SignUp, ResetPassword]으로 활성화된 Verification Code가 존재하지 않으면 반환한다
```

### 로그인

```
POST - /api/v1/auth/signin
```

##### - Description

이메일 또는 전화번호와 비밀번호로 jwt token을 발급받는 로그인 API

##### - Request

```
body - {
  "email": "string",
  "phoneNumber": "string",
  "password": "string"
}
```

##### - Validation

- email 형식 validate
- phoneNumber validate
  - (-) dash 포함해서 입력가능
  - KR Mobile 전화번호 형식 확인
- password validate
  - 8-16자 사이
  - 하나 이상의 영문과 하나 이상의 숫자조합 형식

##### - Response

```
{
  "accessToken": "string",
  "tokenType": "string", => 해당토큰의 타입 (access, refresh)
  "expiration": 0, => access토큰 만료시간 unix time
  "refreshToken": "string",
  "refreshTokenExpiration": 0 => refresh토큰 만료시간 unix time
}

201 - 올바른 입력 값과 미가입된 유저로 회원가입 성공
401 - 해당 이메일 또는 전화번호에 해당하는 유저의 password가 입력된 password와 다르면 반환한다
404 - 입력한 이메일 또는 전화번호에 해당하는 유저데이터를 조회할 수 없는 경우 반환한다
```

### 토큰 갱신

```
POST - /api/v1/auth/token
```

##### - Description

발급받은 refreshToken으로 jwt token을 갱신해주는 API

##### - Request

```
body - {
  "refreshToken": "string"
}
```

##### - Validation

- jwt validate invalid, expired, isJWT

##### - Response

```
{
  "accessToken": "string",
  "tokenType": "string", => 해당토큰의 타입 (access, refresh)
  "expiration": 0, => access토큰 만료시간 unix time
  "refreshToken": "string",
  "refreshTokenExpiration": 0 => refresh토큰 만료시간 unix time
}

201 - 활성화된 refreshToken으로 새로운 accessToken 및 refreshToken 발급
401 - refreshToken 만료, 허용되지 않은 Token일 경우 반환한다
```

#### Common

공통 Response 코드

```
400 - request validation error 올바르지 않은 입력이 들어왔을 때 return
500 - catch를 할 수 없는 error가 발생했을 때 return
```

</div>
</details>

---

# Description

### DI 구성

```
Nestjs는 Module 기준으로 DI를 구현해준다
- import // 지금 moduled로 해당 module에 export 되어있는 provider들을 가져오는 역할을 한다
- provider // 해당 module에서 구현할 인스턴스이다
- controller // 해당 provider로 라우팅을 해주는 역할을 한다
```

<img src="https://github.com/gwon713/ably-auth-api/blob/master/resource/nestjs-di.png"></img>

### 폴더 및 파일 설명

```
app => API를 작동시키는 App들의 리소스 파일 있는 폴더
```

```
libs => 공통적으로 사용하는 모듈 또는 리소스들이 있는 폴더
  |
  |- common
  |  |
  |  |- config => env를 가져와주는 config 모듈
  |  |
  |  |- constant => enum type이나 공통적으로 쓰는 변수들이 폴더
  |  |
  |  |- decorator
  |  |
  |  |- dto
  |  |
  |  |- guard => Spring Security 같이 Nestjs에서 Role, JWT 인증을 Filter 해주는 역할을 하는 리소스들이 있는 폴더
  |  |
  |  |- interface
  |  |
  |  |- model
  |  |
  |  |- transformer => 입력으로 들어온 값을 변경해주는 역할을 하는 리소스들이 있는 폴더
  |  |
  |   - validator => 입력으로 들어온 값을 판별해주는 역할을 하는 리소스들이 있는 폴더
  |
   - database => orm 모듈과 entity가 있는 폴더
```

### 신경썼던 부분

```
- 제일 신경썼던 부분은 API의 Input 부분의 Validation을 가장 많이 신경썼습니다
  백엔드는 어떠한 데이터가 올지 모르기 때문에 일정한 결과를 도출하기 위한 첫번째 단계인 Validation에 집중을 했습니다
  해당 DTO의 Validation의 역할에 대해서는 자세히 주석을 달아놓았습니다
  💡 자세한 Validation 동작은 libs/common/src/dto 안 테스트코드인 spec.ts 파일에서 확인 할 수 있습니다.
```

```
- 전화번호 인증 부분에서도 하나의 API로 회원가입을 수행하기 위한 인증인지 비밀번호 찾기를 수행하기 위한 인증인지 구분해서
  하나의 API로 비슷한 동작을 수행하는 여러 로직들을 수행할 수 있도록 설계하였습니다
```

```
- 예전에 회원가입 API에서 인증번호 받아서 인증을 처리했을 때
  인증번호 유효시간인 3분이 지나면 회원가입을 하지 못했던 문제가 발생했던 경험이 있어서
  인증번호 인증 시에 ttl을 늘려주는 로직을 추가해 봤습니다
```

---

# Test Code

### e2e Test Jest

##### :warning: Before to Start App. Need to Set Up Postgres DB runs on 5432 port and Set ENV file

```bash
docker-compose up -d postgres
```

```bash
mkdir env
echo DB_HOST=localhost > ./env/test.env
```

```bash
npm run test:e2e
```

### e2e Test Result

<img src="https://github.com/gwon713/ably-auth-api/blob/master/resource/e2e-test-result.png"></img>

---
