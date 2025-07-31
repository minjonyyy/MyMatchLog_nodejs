# 🚀 배포 현황 및 문제점 (07_deployment_status.md)

이 문서는 MyMatchLog 프로젝트의 현재 배포 현황과 해결된 문제점, 그리고 남은 작업을 정리합니다.

---

## 📊 현재 배포 현황

### ✅ 성공적으로 완료된 작업

#### 1. AWS 인프라 구축
- **ECR (Elastic Container Registry)**: Docker 이미지 저장소 ✅
- **RDS (MySQL)**: 프로덕션 데이터베이스 ✅
- **ElastiCache (Redis)**: 캐싱 및 분산 락 ✅
- **EC2 인스턴스**: 애플리케이션 서버 ✅
- **보안 그룹**: 네트워크 보안 설정 ✅

#### 2. CI/CD 파이프라인
- **GitHub Actions**: 자동화된 배포 워크플로우 ✅
- **Docker 컨테이너**: 멀티스테이지 빌드 ✅
- **ECR 푸시**: 이미지 자동 업로드 ✅
- **EC2 배포**: SSH를 통한 자동 배포 ✅

#### 3. 애플리케이션 실행
- **서버 실행**: Node.js 애플리케이션 정상 실행 ✅
- **헬스체크**: `/api/health` 엔드포인트 정상 응답 ✅
- **API 응답**: 기본 API 엔드포인트 정상 작동 ✅

---

## 🔍 현재 문제점 및 해결 방법

### ❌ 데이터베이스 연결 문제

#### 문제 상황
```
Error: Access denied for user 'root'@'172.30.3.81' (using password: YES)
```

#### 원인 분석
1. **RDS 보안 그룹 설정**: EC2에서 RDS로의 접근 권한 문제
2. **데이터베이스 사용자 권한**: 사용자 계정 권한 부족
3. **마이그레이션 미실행**: 데이터베이스 스키마 미생성

#### 해결 방법

##### 1. RDS 보안 그룹 설정 확인
```bash
# AWS 콘솔에서 RDS 보안 그룹 확인
# EC2 보안 그룹의 인바운드 규칙이 RDS 보안 그룹에 포함되어 있는지 확인
```

##### 2. 데이터베이스 사용자 권한 확인
```sql
-- RDS에서 사용자 권한 확인
SHOW GRANTS FOR 'root'@'%';

-- 필요한 권한 부여
GRANT ALL PRIVILEGES ON mymatchlog_production.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

##### 3. 마이그레이션 및 시딩 실행
```bash
# EC2 서버에서 마이그레이션 실행
cd /opt/mymatchlog
sudo docker-compose exec app npm run migrate
sudo docker-compose exec app npm run seed
```

---

## 🧪 배포 테스트 결과

### ✅ 성공한 테스트

#### 1. 서버 연결 테스트
```bash
# 헬스체크 성공
curl http://3.37.38.116:3000/api/health
# 응답: {"success":true,"message":"Server is healthy","timestamp":"2025-07-31T06:28:40.094Z"}
```

#### 2. API 엔드포인트 테스트
```bash
# 회원가입 API 유효성 검사 정상 작동
curl http://3.37.38.116:3000/api/users/signup -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@$"}'
# 응답: {"success":false,"error":{"code":"COMMON_INVALID_INPUT","message":"닉네임을 입력해주세요."}}
```

### ❌ 실패한 테스트

#### 1. 데이터베이스 의존 API
```bash
# 팀 목록 조회 실패
curl http://3.37.38.116:3000/api/teams
# 오류: Access denied for user 'root'@'172.30.3.81'

# 경기장 목록 조회 실패
curl http://3.37.38.116:3000/api/stadiums
# 오류: Access denied for user 'root'@'172.30.3.81'
```

---

## 🔧 해결된 배포 문제들

### 1. ECR 권한 문제
**문제**: `User is not authorized to perform: ecr:GetAuthorizationToken`
**해결**: IAM 사용자에 `AmazonEC2ContainerRegistryPowerUser` 정책 추가

### 2. ECR 저장소 이름 문제
**문제**: `repository with name '***' does not exist`
**해결**: GitHub Secrets의 `AWS_ECR_REPOSITORY` 값을 `mymatchlog-api`로 수정

### 3. SSH 키 인증 문제
**문제**: `ssh: no key found` 및 `ssh: handshake failed`
**해결**: GitHub Secrets의 `EC2_KEY_NAME`에 전체 SSH 키 내용 입력

### 4. Docker 권한 문제
**문제**: `permission denied while trying to connect to the Docker daemon socket`
**해결**: EC2에서 Docker 그룹 추가 및 sudo 명령어 사용

### 5. ECR 로그인 문제
**문제**: `no basic auth credentials`
**해결**: EC2 서버에서 AWS CLI 설치 및 ECR 로그인 추가

---

## 📋 다음 작업 목록

### 🔥 우선순위 높음
1. **RDS 보안 그룹 설정 수정**
   - EC2 보안 그룹이 RDS 보안 그룹에 접근할 수 있도록 설정
2. **데이터베이스 마이그레이션 실행**
   - 스키마 생성 및 초기 데이터 입력
3. **API 엔드포인트 완전 테스트**
   - 모든 API가 정상 작동하는지 확인

### 📈 우선순위 중간
1. **프론트엔드 개발 시작**
   - React/Vue.js 기반 사용자 인터페이스
2. **테스트 코드 확장**
   - 단위 테스트 및 통합 테스트 작성
3. **모니터링 도구 설정**
   - 로깅 및 메트릭 수집

### 🔮 우선순위 낮음
1. **성능 최적화**
   - 캐싱 전략 및 데이터베이스 쿼리 최적화
2. **보안 강화**
   - HTTPS 설정, API 레이트 리미팅
3. **백업 및 복구 전략**
   - 자동 백업 및 재해 복구 계획

---

## 🎯 성공 지표

### 현재 달성률
- **인프라 구축**: 100% ✅
- **CI/CD 파이프라인**: 100% ✅
- **애플리케이션 배포**: 90% ✅
- **데이터베이스 연결**: 0% ❌
- **API 완전 테스트**: 30% ⚠️

### 목표 달성률
- **전체 배포 완료**: 85% (데이터베이스 연결만 해결하면 100%)

---

## 📞 문제 해결 가이드

### AWS 콘솔에서 확인할 사항
1. **RDS 보안 그룹**: 인바운드 규칙에 EC2 보안 그룹 추가
2. **EC2 보안 그룹**: 아웃바운드 규칙에서 RDS 포트(3306) 허용
3. **RDS 데이터베이스**: 사용자 권한 및 데이터베이스 생성 상태

### 로컬에서 테스트할 수 있는 명령어
```bash
# 헬스체크
curl http://3.37.38.116:3000/api/health

# 회원가입 테스트
curl http://3.37.38.116:3000/api/users/signup -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@$","nickname":"테스트"}'

# 팀 목록 조회 (데이터베이스 연결 후)
curl http://3.37.38.116:3000/api/teams
```

---

**마지막 업데이트**: 2025-07-31
**배포 상태**: 85% 완료 (데이터베이스 연결 문제 해결 필요) 