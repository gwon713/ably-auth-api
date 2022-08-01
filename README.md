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

---

# :memo: Docs (Swagger)

<code><a href="http://localhost:3001/docs/v1">http://localhost:3001/docs/v1</a></code>

or

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

## API

### User

#### 내 정보 보기

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
200 - request header에 Bearer JWT토큰를 포함해 요청을 보내면
JWT 토큰의 aud(email) 값에 해당하는 유저데이터를 조회 후 반환한다
401 - request header에 JWT토큰 값이 없거나, 만료, 허용되지 않은 Token일 경우 반환한다
404 - request header JWT토큰의 aud(email)에 해당하는 유저데이터를 조회할 수 없는 경우 반환한다
```

#### 회원가입

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
  - KR Mobile 전화번호 형식 확인

##### - Response

```
201 - 올바른 입력 값과 미가입된 유저로 회원가입 성공
401 - 해당 전화번호로 활성화된 SignUp Verification Code가 존재하지 않거나
입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다
409 - 입력받은 이메일과 전화번호가 이미 등록된 사용자가 있을 경우 반환한다
```

#### 비밀번호 재설정

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
  - KR Mobile 전화번호 형식 확인
- verificationCode 형식 validate
  - 6자리 숫자 String 인지 확인
- password validate
  - 8-16자 사이
  - 하나 이상의 영문과 하나 이상의 숫자조합 형식
- passwordConfirm validate password column과 일치한지 확인

##### - Response

```
200 - 올바른 입력 값으로 비밀번호 재설정 성공
401 - 해당 전화번호로 활성화된 ResetPassword Verification Code가 존재하지 않거나
입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다
404 - 입력한 전화번호로 유저데이터를 조회할 수 없는 경우 반환한다
409 - 재설정할 password가 기존에 password와 일치할 경우 반환한다
```

### Auth

#### 토큰 정보 확인

```
GET - /api/v1/auth/token-info
```

##### - Request

```
header - { "Authorization": "Bearer {jwt token}" }
```

##### - Validation

- jwt validate invalid, expired

##### - Response

```
200 - request header에 Bearer JWT토큰를 포함해 요청을 보내면 JWT 토큰 해독 후 반환한다
401 - request header에 JWT토큰 값이 없거나, 만료, 허용되지 않은 Token일 경우 반환한다
```

#### 휴대폰 인증번호 요청 (회원가입, 비밀번호 재설정)

```
POST - /api/v1/auth/generate/code?verificationType=""
```

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
  - KR Mobile 전화번호 형식 확인

##### - Response

```
200 - 올바른 입력 값으로 비밀번호 재설정 성공
401 - 해당 전화번호로 활성화된 ResetPassword Verification Code가 존재하지 않거나
입력받은 Verification Code가 활성화된 Code 정보와 일치하지 않을 때 반환한다
404 - 입력한 전화번호로 유저데이터를 조회할 수 없는 경우 반환한다
409 - 재설정할 password가 기존에 password와 일치할 경우 반환한다
```

#### 휴대폰 인증번호 인증 요청

```
POST - /api/v1/auth/verify/code?verificationType=""
```

#### 로그인

```
POST - /api/v1/auth/signin
```

#### 토큰 갱신

```
POST - /api/v1/auth/token
```

#### Common

공통 Response 코드

```
400 - request validation error 올바르지 않은 입력이 들어왔을 때 return
500 - catch를 할 수 없는 error가 발생했을 때 return
```

---

# Description

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
