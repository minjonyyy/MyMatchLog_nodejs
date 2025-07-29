# 📄 05_exception_policy.md - 예외 처리 및 에러 코드 정책

이 문서는 'MyMatchLog' 프로젝트의 백엔드 예외 처리 정책과 표준 에러 응답 형식을 정의합니다. 일관된 에러 처리를 통해 클라이언트와의 원활한 통신을 보장하는 것을 목표로 합니다.

---

## 1. 표준 에러 응답 형식
모든 API 에러 응답은 아래와 같은 JSON 형식을 따릅니다.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_HERE",
    "message": "A human-readable error message."
  },
  "timestamp": "2024-07-21T10:30:00Z"
}
```
- `success`: 에러 발생 시 항상 `false`
- `error`:
  - `code`: 에러를 식별하는 고유한 문자열 코드
  - `message`: 클라이언트 개발자 또는 사용자에게 보여줄 수 있는 에러 설명
- `timestamp`: 에러 발생 시점의 ISO 8601 형식 타임스탬프

---

## 2. 에러 코드 명명 규칙
에러 코드는 **`{도메인}_{상세내용}`** 형식으로 정의하여 코드만으로도 문제의 원인을 유추할 수 있도록 합니다.

- **도메인 접두사**:
  - `COMMON`: 공통 (인증, 입력값 등)
  - `USER`: 사용자 관련
  - `MATCH`: 직관 기록 관련
  - `EVENT`: 이벤트 관련
  - `SERVER`: 서버 내부 오류

---

## 3. 에러 코드 및 HTTP 상태 코드 매핑

### 3.1 공통 (COMMON)
| 코드 | HTTP 상태 코드 | 메시지 |
| :--- | :--- | :--- |
| `COMMON_INVALID_INPUT` | 400 | 입력값이 유효하지 않습니다. |
| `COMMON_UNAUTHORIZED` | 401 | 인증되지 않은 사용자입니다. |
| `COMMON_FORBIDDEN_ACCESS` | 403 | 접근 권한이 없습니다. |
| `COMMON_RESOURCE_NOT_FOUND` | 404 | 요청한 리소스를 찾을 수 없습니다. |

### 3.2 사용자 (USER)
| 코드 | HTTP 상태 코드 | 메시지 |
| :--- | :--- | :--- |
| `USER_EMAIL_DUPLICATE` | 409 | 이미 사용 중인 이메일입니다. |
| `USER_NICKNAME_DUPLICATE` | 409 | 이미 사용 중인 닉네임입니다. |
| `USER_NOT_FOUND` | 404 | 해당 사용자를 찾을 수 없습니다. |
| `USER_PASSWORD_MISMATCH` | 401 | 비밀번호가 일치하지 않습니다. |

### 3.3 직관 기록 (MATCH)
| 코드 | HTTP 상태 코드 | 메시지 |
| :--- | :--- | :--- |
| `MATCH_LOG_NOT_FOUND` | 404 | 해당 직관 기록을 찾을 수 없습니다. |
| `MATCH_INVALID_OWNER` | 403 | 해당 기록에 대한 수정/삭제 권한이 없습니다. |

### 3.4 이벤트 (EVENT)
| 코드 | HTTP 상태 코드 | 메시지 |
| :--- | :--- | :--- |
| `EVENT_NOT_FOUND` | 404 | 진행 중인 이벤트가 아닙니다. |
| `EVENT_PERIOD_INVALID` | 403 | 이벤트 참여 기간이 아닙니다. |
| `EVENT_CAPACITY_EXCEEDED` | 409 | 선착순 정원이 마감되었습니다. |
| `EVENT_ALREADY_PARTICIPATED` | 409 | 이미 참여한 이벤트입니다. |

### 3.5 서버 (SERVER)
| 코드 | HTTP 상태 코드 | 메시지 |
| :--- | :--- | :--- |
| `SERVER_INTERNAL_ERROR` | 500 | 서버 내부 오류가 발생했습니다. 관리자에게 문의하세요. |
| `SERVER_DB_ERROR` | 500 | 데이터베이스 처리 중 오류가 발생했습니다. |
| `SERVER_OCR_ERROR` | 503 | OCR 서비스 처리 중 오류가 발생했습니다. |

--- 