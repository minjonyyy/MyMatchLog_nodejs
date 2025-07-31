# 🚀 CI/CD 설정 가이드 (06_cicd_setup.md)

이 문서는 MyMatchLog 프로젝트의 CI/CD (Continuous Integration/Continuous Deployment) 파이프라인 설정과 사용법을 설명합니다.

---

## 📋 개요

### 구현된 CI/CD 구성요소

1. **GitHub Actions 워크플로우**
   - `ci.yml`: 코드 품질 검사, 테스트, Docker 빌드
   - `deploy.yml`: 프로덕션 배포 (선택사항)
2. **테스트 환경**
   - Jest + Supertest 기반 테스트
   - MySQL, Redis 서비스 컨테이너
3. **Docker 설정**
   - Multi-stage Dockerfile
   - 프로덕션 최적화
4. **PM2 설정**
   - 프로덕션 프로세스 관리

---

## 🔧 설정 방법

### 1. GitHub Actions 설정

#### 1.1 저장소 설정

1. GitHub 저장소에서 **Settings** → **Secrets and variables** → **Actions**로 이동
2. 다음 시크릿을 추가 (필요시):
   ```
   DB_PASSWORD=your-db-password
   REDIS_PASSWORD=your-redis-password
   ACCESS_TOKEN_SECRET_KEY=your-access-token-secret
   REFRESH_TOKEN_SECRET_KEY=your-refresh-token-secret
   AWS_ACCESS_KEY=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_S3_REGION=ap-northeast-2
   AWS_S3_BUCKET_NAME=your-s3-bucket
   ```

#### 1.2 워크플로우 트리거

- **main 브랜치 푸시**: 자동으로 CI/CD 실행
- **develop 브랜치 푸시**: 테스트만 실행
- **Pull Request**: 테스트 및 코드 품질 검사

### 2. 로컬 테스트 환경 설정

#### 2.1 테스트 환경변수 설정

```bash
# env.test.example을 복사하여 .env.test 생성
cp env.test.example .env.test

# 필요한 환경변수 수정 (현재 사용 중인 환경변수 이름)
# JWT 관련
ACCESS_TOKEN_SECRET_KEY=test-jwt-secret-key-for-testing-only
REFRESH_TOKEN_SECRET_KEY=test-refresh-secret-key-for-testing-only
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS S3 관련
AWS_ACCESS_KEY=test-access-key
AWS_SECRET_ACCESS_KEY=test-secret-key
AWS_S3_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=test-bucket

# 데이터베이스 관련
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mymatchlog_test
DB_USER=root
DB_PASSWORD=testpassword

# Redis 관련
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

nano .env.test
```

#### 2.2 테스트 실행

```bash
# 전체 테스트 실행
npm run test

# 테스트 커버리지 확인
npm run test:coverage

# CI 환경 테스트
npm run test:ci

# 코드 품질 검사
npm run ci:test
```

### 3. Docker 설정

#### 3.1 로컬 Docker 빌드

```bash
# 이미지 빌드
docker build -t mymatchlog-api .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env mymatchlog-api

# Docker Compose로 전체 환경 실행
docker-compose up -d
```

#### 3.2 프로덕션 배포

```bash
# 프로덕션 이미지 빌드
docker build -t mymatchlog-api:prod .

# 프로덕션 컨테이너 실행
docker run -d \
  --name mymatchlog-api \
  -p 3000:3000 \
  --env-file .env.production \
  mymatchlog-api:prod
```

### 4. PM2 설정

#### 4.1 PM2 설치

```bash
npm install -g pm2
```

#### 4.2 애플리케이션 실행

```bash
# 개발 환경
pm2 start ecosystem.config.js

# 프로덕션 환경
pm2 start ecosystem.config.js --env production

# 테스트 환경
pm2 start ecosystem.config.js --env test
```

#### 4.3 PM2 관리 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs mymatchlog-api

# 재시작
pm2 restart mymatchlog-api

# 중지
pm2 stop mymatchlog-api

# 삭제
pm2 delete mymatchlog-api
```

---

## 🔄 CI/CD 파이프라인 흐름

### 1. 코드 푸시 시 자동 실행

```
코드 푸시 → GitHub Actions 트리거 → 테스트 실행 → 결과 보고
```

### 2. 테스트 단계

1. **환경 설정**: Node.js 18, MySQL, Redis 설정
2. **의존성 설치**: `npm ci`
3. **데이터베이스 마이그레이션**: 스키마 생성
4. **시딩**: 테스트 데이터 생성
5. **코드 품질 검사**: ESLint, Prettier
6. **테스트 실행**: Jest + Supertest
7. **커버리지 리포트**: Codecov 업로드
8. **Docker 빌드**: 이미지 생성 및 테스트
9. **보안 검사**: npm audit

### 3. 배포 단계 (선택사항)

1. **테스트 통과 확인**
2. **빌드 검증**
3. **배포 실행** (설정된 플랫폼에 따라)

---

## 📊 모니터링 및 로깅

### 1. GitHub Actions 대시보드

- **Actions 탭**: 워크플로우 실행 상태 확인
- **실행 로그**: 각 단계별 상세 로그
- **아티팩트**: 테스트 결과, 커버리지 리포트

### 2. PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 웹 대시보드
pm2 web

# 로그 확인
pm2 logs --lines 100
```

### 3. Docker 모니터링

```bash
# 컨테이너 상태 확인
docker ps

# 리소스 사용량 확인
docker stats

# 로그 확인
docker logs mymatchlog-api
```

---

## 🛠️ 문제 해결

### 1. 테스트 실패 시

```bash
# 로컬에서 테스트 재실행
npm run test

# 특정 테스트만 실행
npm test -- --testNamePattern="App"

# 디버그 모드로 실행
npm test -- --verbose
```

### 2. Docker 빌드 실패 시

```bash
# 캐시 없이 빌드
docker build --no-cache -t mymatchlog-api .

# 빌드 로그 확인
docker build -t mymatchlog-api . 2>&1 | tee build.log
```

### 3. PM2 문제 시

```bash
# PM2 로그 확인
pm2 logs mymatchlog-api --err

# 프로세스 재시작
pm2 restart mymatchlog-api

# 설정 리로드
pm2 reload mymatchlog-api
```

---

## 📈 성능 최적화

### 1. CI/CD 최적화

- **캐싱**: npm 캐시, Docker 레이어 캐싱
- **병렬 실행**: 독립적인 작업들을 병렬로 실행
- **조건부 실행**: 필요한 경우에만 특정 단계 실행

### 2. 프로덕션 최적화

- **멀티스테이지 빌드**: Docker 이미지 크기 최소화
- **클러스터 모드**: PM2를 통한 멀티 프로세스 실행
- **헬스체크**: 자동 복구 및 로드밸런싱

---

## 🔮 향후 개선 계획

### 1. 고급 CI/CD 기능

- **자동 버전 관리**: Semantic Versioning
- **릴리즈 노트 자동 생성**: 변경사항 요약
- **슬랙/디스코드 알림**: 배포 상태 알림

### 2. 보안 강화

- **정적 분석**: SonarQube, CodeQL
- **컨테이너 보안**: Trivy, Snyk
- **의존성 취약점 스캔**: 자동 업데이트

### 3. 모니터링 확장

- **APM 도구**: New Relic, DataDog
- **로그 집계**: ELK Stack, Fluentd
- **메트릭 수집**: Prometheus, Grafana

---

## 📚 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Jest 테스팅 프레임워크](https://jestjs.io/)
- [PM2 프로세스 매니저](https://pm2.keymetrics.io/)
- [Docker 공식 문서](https://docs.docker.com/)
- [Node.js 프로덕션 모범 사례](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
