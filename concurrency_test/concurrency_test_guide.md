# 동시성 테스트 스위트

이 폴더는 MyMatchLog 이벤트 시스템의 동시성 제어 기능을 테스트하기 위한 스크립트들을 포함합니다.

## 📁 폴더 구조

```
concurrency_test/
├── README.md                           # 이 파일
├── run_all_tests.sh                    # 모든 테스트를 순차 실행
├── simple_concurrency_test.sh          # 간단한 동시성 테스트 (10명)
├── retry_concurrency_test.sh           # 재시도 로직 포함 테스트 (10명)
├── concurrency_test.sh                 # 대규모 동시성 테스트 (100명)
└── results/                            # 테스트 결과 파일들
    ├── simple_concurrency_results.txt
    ├── retry_concurrency_results.txt
    └── concurrency_results.txt
```

## 🚀 테스트 실행 방법

### 1. 모든 테스트 순차 실행
```bash
chmod +x concurrency_test/run_all_tests.sh
./concurrency_test/run_all_tests.sh
```

### 2. 개별 테스트 실행

#### 간단한 동시성 테스트 (10명)
```bash
chmod +x concurrency_test/simple_concurrency_test.sh
./concurrency_test/simple_concurrency_test.sh
```

#### 재시도 로직 포함 테스트 (10명)
```bash
chmod +x concurrency_test/retry_concurrency_test.sh
./concurrency_test/retry_concurrency_test.sh
```

#### 대규모 동시성 테스트 (100명)
```bash
chmod +x concurrency_test/concurrency_test.sh
./concurrency_test/concurrency_test.sh
```

## 📊 테스트 시나리오

### 1. Simple Concurrency Test
- **목적**: 기본적인 동시성 제어 테스트
- **참여자**: 10명
- **정원**: 3명
- **예상 결과**: 정확히 3명만 성공, 나머지는 정원 마감

### 2. Retry Concurrency Test
- **목적**: 재시도 로직이 포함된 동시성 제어 테스트
- **참여자**: 10명
- **정원**: 3명
- **재시도**: 최대 5회
- **예상 결과**: 정확히 3명 성공, 나머지는 재시도 후 정원 마감

### 3. Large Scale Concurrency Test
- **목적**: 대규모 동시성 제어 테스트
- **참여자**: 100명
- **정원**: 3명
- **예상 결과**: 정확히 3명만 성공, 나머지는 정원 마감

## 🔧 테스트 전제 조건

1. **서버 실행**: `npm run start:dev`
2. **데이터베이스**: MySQL 및 Redis 실행 중
3. **이벤트 존재**: ID가 2인 이벤트가 존재해야 함

## 📈 결과 해석

### 성공적인 동시성 제어의 지표

1. **정확한 정원 관리**: 설정된 정원(3명)만큼만 성공
2. **데이터 일관성**: `participant_count`가 정확히 3
3. **공정한 처리**: 선착순으로 처리
4. **락 메커니즘**: Redis 분산 락이 정상 작동

### 예상 결과 예시

```
📈 최종 결과:
성공한 참여: 3명
정원 마감으로 실패: 7명
총 요청: 10명
```

## 🛠️ 문제 해결

### 일반적인 문제들

1. **토큰 만료**: 테스트 중 JWT 토큰이 만료될 수 있음
2. **데이터베이스 연결**: MySQL/Redis 연결 확인
3. **권한 문제**: 스크립트 실행 권한 확인 (`chmod +x`)

### 디버깅

```bash
# 서버 로그 확인
tail -f logs/app.log

# 데이터베이스 상태 확인
docker exec -it mymatchlog_mysql mysql -u root -pdbpassword -e "USE mymatchlog_dev; SELECT * FROM events WHERE id = 2;"

# Redis 상태 확인
docker exec -it mymatchlog_redis redis-cli -a redispassword
```

## 📝 테스트 결과 예시

### 성공적인 테스트 결과
```
🚀 재시도 동시성 테스트 시작 - 10명이 동시에 이벤트 참여 (재시도 포함)
이벤트 ID: 2
최대 재시도 횟수: 5
시작 시간: Wed Jul 30 16:07:22 KST 2025
==========================================
사용자 1: 성공 (시도 1) - {"success":true,"data":{"participationId":6},"message":"이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요."}
사용자 10: 성공 (시도 2) - {"success":true,"data":{"participationId":7},"message":"이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요."}
사용자 6: 성공 (시도 3) - {"success":true,"data":{"participationId":8},"message":"이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요."}
사용자 3: 정원 마감 (시도 4) - {"success":false,"error":{"code":"EVENT_CAPACITY_EXCEEDED","message":"선착순 정원이 마감되었습니다."}}
==========================================
📈 최종 결과:
성공한 참여: 3명
정원 마감으로 실패: 3명
락 획득 실패 (재시도 후): 24회
최대 재시도 초과: 4명
총 요청: 10명
```

이 결과는 Redis 분산 락과 트랜잭션이 완벽하게 작동하여 정확히 3명만 성공했음을 보여줍니다. 