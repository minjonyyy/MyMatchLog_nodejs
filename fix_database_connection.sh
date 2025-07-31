#!/bin/bash

# 데이터베이스 연결 문제 해결 스크립트
echo "🔧 데이터베이스 연결 문제 해결을 시작합니다..."

# 1. EC2 서버에 접속하여 Docker 컨테이너 상태 확인
echo "📋 1. Docker 컨테이너 상태 확인"
echo "ssh -i your-key.pem ubuntu@3.37.38.116"
echo "sudo docker ps"
echo "sudo docker-compose ps"

# 2. 데이터베이스 연결 테스트
echo ""
echo "📋 2. 데이터베이스 연결 테스트"
echo "sudo docker-compose exec app node -e \""
echo "import pool from './src/config/database.js';"
echo "pool.getConnection().then(conn => {"
echo "  console.log('✅ DB 연결 성공');"
echo "  conn.release();"
echo "}).catch(err => {"
echo "  console.error('❌ DB 연결 실패:', err.message);"
echo "});"
echo "\""

# 3. 환경변수 확인
echo ""
echo "📋 3. 환경변수 확인"
echo "sudo docker-compose exec app env | grep DB_"

# 4. RDS 보안 그룹 설정 확인
echo ""
echo "📋 4. RDS 보안 그룹 설정 확인 (AWS 콘솔에서)"
echo "AWS 콘솔 → RDS → 데이터베이스 → 보안 그룹"
echo "인바운드 규칙에 EC2 보안 그룹이 포함되어 있는지 확인"
echo "규칙: MySQL/Aurora (3306) | 소스: EC2 보안 그룹 ID"

# 5. 데이터베이스 마이그레이션 실행
echo ""
echo "📋 5. 데이터베이스 마이그레이션 실행"
echo "sudo docker-compose exec app npm run migrate"
echo "sudo docker-compose exec app npm run seed"

# 6. API 테스트
echo ""
echo "📋 6. API 테스트"
echo "curl http://3.37.38.116:3000/api/teams"
echo "curl http://3.37.38.116:3000/api/stadiums"

echo ""
echo "✅ 스크립트 완료. 위 단계들을 순서대로 실행해주세요." 