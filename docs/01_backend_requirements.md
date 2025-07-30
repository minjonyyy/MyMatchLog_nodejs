# 📄 01_backend_requirements.md - 기능 요구사항 정의서

이 문서는 'MyMatchLog' 프로젝트 백엔드 개발을 위한 기능 요구사항을 정의합니다. API를 중심으로 각 기능의 우선순위와 관련 엔드포인트를 명시합니다.

---

## 🚀 주요 기능 요구사항

| ID | 기능 설명 | 우선순위 | 관련 API |
| :--- | :--- | :--- | :--- |
| **공통** | | | |
| BE-000 | 팀 목록 조회 | 중간 | `GET /api/teams` |
| BE-001 | 경기장 목록 조회 | 중간 | `GET /api/stadiums` |
| **사용자** | | | |
| BE-002 | 사용자 회원가입 | 높음 | `POST /api/users/signup` |
| BE-003 | 사용자 로그인 (JWT 발급) | 높음 | `POST /api/users/login` |
| BE-004 | 내 정보 조회 | 높음 | `GET /api/users/me` |
| BE-005 | 내 정보 수정 (닉네임, 응원팀) | 중간 | `PATCH /api/users/me` |
| **직관 기록** | | | |
| BE-006 | 티켓 이미지 OCR 정보 추출 요청 | 높음 | `POST /api/ocr/parse-ticket` |
| BE-007 | 직관 기록 생성 (티켓 이미지 포함) | 높음 | `POST /api/match-logs` |
| BE-008 | 내 직관 기록 목록 조회 | 높음 | `GET /api/match-logs` |
| BE-009 | 직관 기록 상세 조회 | 높음 | `GET /api/match-logs/:id` |
| BE-010 | 직관 기록 수정 | 중간 | `PATCH /api/match-logs/:id` |
| BE-011 | 직관 기록 삭제 | 중간 | `DELETE /api/match-logs/:id` |
| **이벤트** | | | |
| BE-012 | 진행 중인 이벤트 목록 조회 | 높음 | `GET /api/events` |
| BE-013 | 이벤트 상세 조회 | 높음 | `GET /api/events/:id` |
| BE-014 | 이벤트 선착순 참여 (동시성 제어) | 높음 | `POST /api/events/:id/participate` |
| **관리자** | | | |
| BE-015 | 이벤트 생성 | 낮음 | `POST /api/admin/events` |
| BE-016 | 이벤트 참여자 목록 조회 | 낮음 | `GET /api/admin/events/:id/participants` |

--- 