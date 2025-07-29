# 📄 02_db_schema.md - DB 설계 문서

이 문서는 'MyMatchLog' 프로젝트의 데이터베이스 스키마를 정의합니다. 각 테이블의 구조, 컬럼, 제약조건 및 관계를 설명합니다.

---

## 🗂️ 테이블 목록
1. `teams` - 야구팀 마스터 정보
2. `users` - 사용자 정보
3. `match_logs` - 경기 직관 기록
4. `events` - 선착순 이벤트 정보
5. `event_participations` - 이벤트 참여 기록

---

### 1. 테이블명: `teams`
- **설명**: KBO 리그 팀 정보를 저장하는 마스터 테이블
- **컬럼 구조**:
| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PK`, `Auto Increment` | 팀 고유 ID |
| `name` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | 팀 이름 (예: LG 트윈스) |
| `logo_url` | `VARCHAR(2048)` | | 팀 로고 이미지 URL |
| `home_stadium` | `VARCHAR(100)` | | 홈구장 이름 |

---

### 2. 테이블명: `users`
- **설명**: 서비스 사용자의 기본 정보를 저장하는 테이블
- **컬럼 구조**:
| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, `Auto Increment` | 사용자 고유 ID |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | 로그인 이메일 |
| `password` | `VARCHAR(255)` | `NOT NULL` | 해시된 비밀번호 |
| `nickname` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | 사용자 닉네임 |
| `favorite_team_id` | `INT` | `FK` | 응원팀 ID (`teams.id`) |
| `created_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |
| `updated_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 수정 일시 |

- **관계**:
  - `users.favorite_team_id` → `teams.id` (N:1)
  - `match_logs.user_id` → `users.id` (1:N)
  - `event_participations.user_id` → `users.id` (1:N)

---

### 3. 테이블명: `match_logs`
- **설명**: 사용자가 기록한 야구 직관 정보를 저장하는 테이블
- **컬럼 구조**:
| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, `Auto Increment` | 직관 기록 고유 ID |
| `user_id` | `BIGINT` | `FK`, `NOT NULL` | 기록을 작성한 사용자 ID |
| `match_date` | `DATE` | `NOT NULL` | 경기 날짜 |
| `home_team` | `VARCHAR(50)` | `NOT NULL` | 홈팀 이름 |
| `away_team` | `VARCHAR(50)` | `NOT NULL` | 원정팀 이름 |
| `stadium` | `VARCHAR(100)` | `NOT NULL` | 경기장 |
| `result` | `ENUM('WIN', 'LOSS', 'DRAW')` | | 경기 결과 (승/패/무) |
| `memo` | `TEXT` | | 개인 메모 |
| `ticket_image_url` | `VARCHAR(2048)` | | 티켓 이미지 S3 URL |
| `created_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |
| `updated_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 수정 일시 |

---

### 4. 테이블명: `events`
- **설명**: 선착순 이벤트 정보를 관리하는 테이블
- **컬럼 구조**:
| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, `Auto Increment` | 이벤트 고유 ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | 이벤트 제목 |
| `description` | `TEXT` | | 이벤트 설명 |
| `start_at` | `DATETIME` | `NOT NULL` | 이벤트 시작 시간 |
| `end_at` | `DATETIME` | `NOT NULL` | 이벤트 종료 시간 |
| `gift` | `VARCHAR(255)` | `NOT NULL` | 이벤트 상품 |
| `capacity` | `INT` | `NOT NULL` | 선착순 정원 |
| `participant_count` | `INT` | `NOT NULL`, `DEFAULT 0` | 현재 참여자 수 |
| `created_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |
| `updated_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 수정 일시 |

- **관계**:
  - `event_participations.event_id` → `events.id` (1:N)

---

### 5. 테이블명: `event_participations`
- **설명**: 사용자의 이벤트 참여 상태를 기록하여 중복 참여를 방지하는 테이블
- **컬럼 구조**:
| 컬럼명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK`, `Auto Increment` | 참여 기록 고유 ID |
| `user_id` | `BIGINT` | `FK`, `NOT NULL` | 참여한 사용자 ID |
| `event_id` | `BIGINT` | `FK`, `NOT NULL` | 참여한 이벤트 ID |
| `status` | `ENUM('APPLIED', 'WON', 'LOST')`| `NOT NULL`, `DEFAULT 'APPLIED'` | 참여 상태 (신청/당첨/미당첨) |
| `created_at` | `DATETIME` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | 참여 일시 |
- **인덱스**:
  - `UNIQUE INDEX (user_id, event_id)`: 사용자별 이벤트 중복 참여 방지를 위한 복합 유니크 키

--- 