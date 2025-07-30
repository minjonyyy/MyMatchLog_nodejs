# ✅ MyMatchLog 백엔드 개발 체크리스트 (backend_todolist.md)

이 문서는 MyMatchLog 프로젝트의 백엔드 개발 작업을 체계적으로 추적하고 관리하기 위한 체크리스트입니다. `docs` 폴더의 관련 기획/설계 문서를 기반으로 작성되었습니다.

---

## ⚙️ 1. 프로젝트 설정 및 공통 인프라

### 1.1. 개발 환경
- [x] Node.js, npm, Express.js 기반 프로젝트 초기화
- [x] `nodemon`을 이용한 개발 서버 핫 리로드 환경 구축
- [x] `ESLint`, `Prettier`를 활용한 코드 포맷팅 및 컨벤션 설정
- [x] `dotenv`를 활용한 환경변수 관리 (`.env`, `.env.development`, `.env.production`)
- [x] 기능별 도메인 기반 폴더 구조 설정 (`/src/domains/*`)

### 1.2. 핵심 미들웨어 및 로직
- [x] `cors`, `helmet` 등 기본 보안 미들웨어 적용
- [x] API 성공/실패 응답을 위한 공통 응답 형식 래퍼(Wrapper) 구현
- [x] 전역 예외 처리를 위한 에러 핸들링 미들웨어 (`error.middleware.js`)
- [x] BaseError 및 도메인별 커스텀 에러 클래스 정의 (`/src/errors`)
- [x] JWT(Access Token, Refresh Token) 발급 및 검증을 위한 인증 미들웨어 구현 (`auth.middleware.js`)

### 1.3. 데이터베이스 및 외부 서비스
- [x] MySQL 데이터베이스 연결 설정
- [x] 데이터베이스 스키마 생성(Migration) 스크립트 작성
- [x] `teams` 마스터 데이터 시딩(Seeding) 스크립트 작성
- [x] Redis 연결 설정 (이벤트 동시성 제어용)
- [x] `multer` 및 AWS S3 SDK 연동을 통한 파일 업로드 모듈 구현
- [x] `Swagger(OpenAPI)`를 이용한 API 문서 자동화 설정

---

## 👤 2. 사용자 도메인 (User Domain)

- [x] **BE-001: 사용자 회원가입 (`POST /api/users/signup`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 이메일, 닉네임 중복 검사 로직
  - [x] 비밀번호 해싱 (bcrypt) 적용
- [x] **BE-002: 사용자 로그인 (`POST /api/users/login`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 로그인 성공 시 JWT(Access Token, Refresh Token) 발급
- [ ] **BE-003: Access Token 갱신 (`POST /api/users/token`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] Refresh Token을 검증하여 새로운 Access Token 발급
- [ ] **BE-004: 내 정보 조회 (`GET /api/users/me`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] 인증 미들웨어를 통한 사용자 식별
- [ ] **BE-005: 내 정보 수정 (`PATCH /api/users/me`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] 닉네임, 응원팀 선택적 업데이트 로직

---

## ⚾ 3. 직관 기록 도메인 (Match Log Domain)

- [ ] **BE-006: 티켓 OCR 정보 추출 (`POST /api/ocr/parse-ticket`)**
  - [ ] 외부 OCR 서비스(Naver, Google) API 연동 로직
  - [ ] 이미지 파일을 받아 OCR API로 전송 및 결과 반환
- [ ] **BE-007: 직관 기록 생성 (`POST /api/match-logs`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] `multipart/form-data` 요청 처리
  - [ ] 티켓 이미지 S3 업로드 및 URL DB 저장
- [ ] **BE-008: 내 직관 기록 목록 조회 (`GET /api/match-logs`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] 페이지네이션(Pagination) 기능 구현
- [ ] **BE-009: 직관 기록 상세 조회 (`GET /api/match-logs/:id`)**
  - [ ] Controller, Service, Repository 계층 구현
- [ ] **BE-010: 직관 기록 수정 (`PATCH /api/match-logs/:id`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] 기록 소유권 검증 로직 (본인만 수정 가능)
- [ ] **BE-011: 직관 기록 삭제 (`DELETE /api/match-logs/:id`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] 기록 소유권 검증 로직 (본인만 삭제 가능)

---

## 🎉 4. 이벤트 도메인 (Event Domain)

- [ ] **BE-012: 진행 중인 이벤트 목록 조회 (`GET /api/events`)**
  - [ ] Controller, Service, Repository 계층 구현
- [ ] **BE-013: 이벤트 상세 조회 (`GET /api/events/:id`)**
  - [ ] Controller, Service, Repository 계층 구현
- [ ] **BE-014: 이벤트 선착순 참여 (`POST /api/events/:id/participate`)**
  - [ ] Controller, Service, Repository 계층 구현
  - [ ] **Redis 분산 락(Distributed Lock)을 이용한 동시성 제어 구현**
  - [ ] 이벤트 참여 가능 기간 검증 로직
  - [ ] 선착순 정원 마감 여부 확인 로직
  - [ ] 중복 참여 방지 로직 (UNIQUE INDEX 및 추가 검증)
  - [ ] `participant_count` 증가 및 참여 정보 저장을 위한 트랜잭션 처리

---

## 👑 5. 관리자 기능 (Admin Domain)

- [ ] 관리자 권한을 확인하는 전용 미들웨어 구현
- [ ] **BE-015: 이벤트 생성 (`POST /api/admin/events`)**
  - [ ] Controller, Service, Repository 계층 구현
- [ ] **BE-016: 이벤트 참여자 목록 조회 (`GET /api/admin/events/:id/participants`)**
  - [ ] Controller, Service, Repository 계층 구현

---

## 🧪 6. 테스트 및 배포

- [ ] `Jest` 및 `Supertest` 테스트 환경 구축
- [ ] 주요 Service 로직에 대한 단위 테스트(Unit Test) 작성
- [ ] 주요 API 엔드포인트에 대한 통합 테스트(Integration Test) 작성
- [ ] `PM2`를 이용한 운영 서버 프로세스 관리 스크립트 작성
- [ ] (선택) `GitHub Actions`를 이용한 CI/CD 파이프라인 구축 