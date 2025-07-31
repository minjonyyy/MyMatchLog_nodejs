# 🛠️ Node.js Express 백엔드 기술 가이드 (backend_tech_guide_node.md)

다음 5개의 문서 (요구사항 정의서, DB 설계서, API 명세서, 아키텍처 문서, 예외 처리 정책)를 참고하여,  
이 프로젝트의 기술 요약 문서(`backend_tech_summary.md`)를 작성해 주세요.

---

## 📌 기술 요약 문서에 반드시 포함되어야 할 항목:

### 1. 사용 기술 스택

- Node.js (LTS) + Express.js
- database : 프로젝트 특성에 맞게 설정
- JWT 기반 인증
- dotenv 환경변수
- cors, helmet 등 보안 미들웨어
- Swagger (API 문서화)
- Jest, Supertest (테스트)

---

### 2. 주요 아키텍처 개요

- 폴더 구조
  - 도메인 주도 설계: 기능별 패키지 분리
  - MVC 패턴 또는 Layered Architecture
- 인증: JWT 기반 Middleware 처리
- 공통 응답 처리 유틸 함수 사용
- 예외 처리: Error Handling Middleware 구성
- 라우팅 → 컨트롤러 → 서비스 → DB 레이어로 흐름 구성

---

### 3. 개발 환경 및 빌드 도구

- Node.js + npm 또는 yarn
- nodemon for Dev (Hot Reload)
- ESLint + Prettier (코드 컨벤션)
- 환경변수: .env 파일 사용

---

### 4. 데이터 흐름 및 테스트 전략

- 요청 → 라우터 → 컨트롤러 → 서비스 → 모델(DB)
- 응답은 일관된 JSON 포맷으로 반환
- 단위 테스트: Jest
- API 테스트: Supertest 또는 Postman Collection
- 테스트 환경 분리: `.env.test`

---

### 5. 공통 개발 규칙

- 모든 응답은 다음과 같은 형식 사용:

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

- 예외 발생 시:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "존재하지 않는 사용자입니다."
  }
}
```

- 모든 비즈니스 에러는 커스텀 Error 클래스로 처리
- 미들웨어: 인증 / 에러 처리 / 로깅 분리

---

### 6. 예상 폴더 구조 (Node.js + Express 기준)

```
src/
├── app.js
├── routes/
│   └── user.routes.js
├── controllers/
│   └── user.controller.js
├── services/
│   └── user.service.js
├── models/
│   └── user.model.js
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── utils/
│   └── response.js
├── config/
│   └── db.js
└── tests/
    └── user.test.js
```

---

### 7. 향후 확장 및 유지보수 고려사항

- API 문서 자동화: Swagger
- 배포 도구: PM2 + Nginx
- 파일 업로드: Multer + S3 연동 가능
- 인증 확장: OAuth2, 소셜 로그인
- TypeScript 전환 고려 (ts-node-dev)
