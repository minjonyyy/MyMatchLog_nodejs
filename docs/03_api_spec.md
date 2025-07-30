# 📄 03_api_spec.md - API 명세서

이 문서는 'MyMatchLog' 프로젝트의 REST API 명세를 정의합니다. 각 API의 엔드포인트, 메서드, 인증 여부, 요청 및 응답 형식, 상태 코드를 상세히 기술합니다.

---

## 🏟️ 공통 (Common)

### 1. 팀 목록 조회
- **URL**: `GET /api/teams`
- **설명**: KBO 리그의 모든 팀 목록을 조회합니다. 사용자가 응원팀을 선택할 때 사용됩니다.
- **인증**: 불필요
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": 1,
        "name": "LG 트윈스",
        "logo_url": "https://example.com/lg-logo.png",
        "home_stadium": "잠실야구장"
      },
      {
        "id": 2,
        "name": "두산 베어스",
        "logo_url": "https://example.com/doosan-logo.png",
        "home_stadium": "잠실야구장"
      }
    ]
  },
  "message": "팀 목록 조회에 성공했습니다."
}
```
- **주요 상태 코드**:
  - `200 OK`: 성공

---

## 👤 사용자 (Users)

### 1. 사용자 회원가입
- **URL**: `POST /api/users/signup`
- **설명**: 새로운 사용자를 시스템에 등록합니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`
  - `email` (string, required): 유효한 이메일 형식이어야 합니다.
  - `password` (string, required): 최소 8자 이상이며, 대/소문자, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.
  - `nickname` (string, required): 중복되지 않는 닉네임이어야 합니다.
```json
{
  "email": "mymatchlog@example.com",
  "password": "Password123!",
  "nickname": "야구팬"
}
```
- **응답 (Response)**: `201 CREATED`
```json
{
  "success": true,
  "data": {
    "userId": 1
  },
  "message": "회원가입이 완료되었습니다."
}
```
- **주요 상태 코드**:
  - `201 CREATED`: 성공
  - `400 BAD REQUEST`: 입력값 유효성 검사 실패
  - `409 CONFLICT`: 이메일 중복 (`USER_EMAIL_DUPLICATE`)
  - `409 CONFLICT`: 닉네임 중복 (`USER_NICKNAME_DUPLICATE`)

### 2. 사용자 로그인
- **URL**: `POST /api/users/login`
- **설명**: 이메일과 비밀번호로 로그인하고 JWT를 발급받습니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`
```json
{
  "email": "mymatchlog@example.com",
  "password": "password123!"
}
```
- **응답 (Response)**: `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "로그인에 성공했습니다."
}
```
- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 비밀번호 불일치 (`USER_PASSWORD_MISMATCH`)
  - `404 NOT FOUND`: 존재하지 않는 사용자 (`USER_NOT_FOUND`)

### 3. 내 정보 수정 (닉네임, 응원팀)
- **URL**: `PATCH /api/users/me`
- **설명**: 현재 로그인된 사용자의 정보(닉네임, 응원팀)를 수정합니다. 두 필드 모두 선택적으로 전송할 수 있습니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `application/json`
```json
{
  "nickname": "열혈야구팬",
  "favorite_team_id": 1
}
```
- **응답 (Response)**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "nickname": "열혈야구팬",
      "favorite_team_id": 1
    }
  },
  "message": "사용자 정보가 성공적으로 업데이트되었습니다."
}
```
- **주요 상태 코드**:
  - `200 OK`: 성공
  - `400 BAD REQUEST`: 유효하지 않은 `favorite_team_id`
  - `401 UNAUTHORIZED`: 인증 실패
  - `409 CONFLICT`: 닉네임이 이미 존재함

### 4. Access Token 갱신
- **URL**: `POST /api/users/token`
- **설명**: 유효한 Refresh Token을 사용하여 만료된 Access Token을 갱신합니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **응답 (Response)**: `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new..."
  },
  "message": "Access Token이 성공적으로 갱신되었습니다."
}
```
- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 유효하지 않거나 만료된 Refresh Token

---

## ⚾ 직관 기록 (Match Logs)

### 1. 직관 기록 생성
- **URL**: `POST /api/match-logs`
- **설명**: 새로운 직관 기록을 생성합니다. 티켓 이미지를 포함할 수 있습니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `multipart/form-data`
  - `match_date` (Date): `2024-07-21`
  - `stadium` (String): `잠실야구장`
  - `home_team` (String): `LG 트윈스`
  - `away_team` (String): `두산 베어스`
  - `memo` (String, Optional): `꿀잼 경기!`
  - `ticket_image` (File, Optional): (binary image data)
- **응답 (Response)**: `201 CREATED`
```json
{
  "success": true,
  "data": {
    "matchLogId": 10
  },
  "message": "직관 기록이 성공적으로 등록되었습니다."
}
```
- **주요 상태 코드**:
  - `201 CREATED`: 성공
  - `400 BAD REQUEST`: 필수 입력값 누락
  - `401 UNAUTHORIZED`: 인증 실패

---

## 🎉 이벤트 (Events)

### 1. 이벤트 선착순 참여
- **URL**: `POST /api/events/:id/participate`
- **설명**: 지정된 ID의 이벤트에 선착순으로 참여를 신청합니다. 동시성 제어가 필수적입니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: 없음
- **응답 (Response)**: `200 OK`
```json
{
  "success": true,
  "data": {
    "participationId": 123
  },
  "message": "이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요."
}
```
- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 이벤트 참여 기간이 아님
  - `404 NOT FOUND`: 존재하지 않는 이벤트
  - `409 CONFLICT`: 이미 참여한 이벤트입니다. (`EVENT_ALREADY_PARTICIPATED`)
  - `409 CONFLICT`: 선착순 정원이 마감되었습니다. (`EVENT_CAPACITY_EXCEEDED`)
  - `429 TOO MANY REQUESTS`: 과도한 요청 (Rate Limit)

--- 