#!/bin/bash

# 프로덕션 데이터베이스 연결 문제 즉시 해결 스크립트
echo "🔧 프로덕션 데이터베이스 연결 문제 해결을 시작합니다..."

# 1. 현재 환경변수 확인
echo "📋 1. 현재 환경변수 확인"
echo "sudo docker-compose exec app env | grep DB_"

# 2. GitHub Secrets에 추가해야 할 환경변수
echo ""
echo "📋 2. GitHub Secrets에 추가해야 할 환경변수"
echo "다음 Secrets를 GitHub 저장소에 추가해주세요:"
echo ""
echo "DB_USER=admin (또는 root)"
echo "DB_NAME=mymatchlog_production"
echo "AWS_S3_BUCKET_NAME=your-s3-bucket-name"
echo ""

# 3. RDS 보안 그룹 설정 확인
echo "📋 3. RDS 보안 그룹 설정 확인 (AWS 콘솔에서)"
echo "AWS 콘솔 → RDS → 데이터베이스 → 보안 그룹"
echo "인바운드 규칙에 다음을 추가:"
echo "- 유형: MySQL/Aurora (3306)"
echo "- 소스: EC2 보안 그룹 ID"
echo ""

# 4. 수동으로 환경변수 설정 (임시 해결책)
echo "📋 4. 수동으로 환경변수 설정 (임시 해결책)"
echo "EC2 서버에서 다음 명령어 실행:"
echo ""
echo "cd /opt/mymatchlog"
echo "sudo docker-compose down"
echo ""
echo "# docker-compose.yml 파일 수정"
echo "sudo nano docker-compose.yml"
echo ""
echo "# environment 섹션에 다음 추가:"
echo "  - DB_USER=admin"
echo "  - DB_NAME=mymatchlog_production"
echo "  - DB_PORT=3306"
echo "  - REDIS_PORT=6379"
echo "  - ACCESS_TOKEN_EXPIRES_IN=15m"
echo "  - REFRESH_TOKEN_EXPIRES_IN=7d"
echo "  - AWS_S3_REGION=ap-northeast-2"
echo "  - AWS_S3_BUCKET_NAME=your-s3-bucket-name"
echo "  - PORT=3000"
echo ""
echo "sudo docker-compose up -d"

# 5. 데이터베이스 마이그레이션 실행
echo ""
echo "📋 5. 데이터베이스 마이그레이션 실행"
echo "sudo docker-compose exec app npm run migrate"
echo "sudo docker-compose exec app npm run seed"

# 6. 연결 테스트
echo ""
echo "📋 6. 연결 테스트"
echo "curl http://3.37.38.116:3000/api/teams"
echo "curl http://3.37.38.116:3000/api/stadiums"

echo ""
echo "✅ 스크립트 완료. 위 단계들을 순서대로 실행해주세요." 