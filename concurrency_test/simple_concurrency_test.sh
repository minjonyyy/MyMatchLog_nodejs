#!/bin/bash

# 한글 인코딩 설정
export LC_ALL=ko_KR.UTF-8
export LANG=ko_KR.UTF-8

# 간단한 동시성 테스트 스크립트
# 10명이 동시에 이벤트에 참여하는 시나리오

EVENT_ID=2
BASE_URL="http://localhost:3000"
RESULTS_DIR="concurrency_test/results"
RESULTS_FILE="$RESULTS_DIR/simple_concurrency_results.txt"

# 결과 디렉토리 생성
mkdir -p $RESULTS_DIR

echo "🚀 간단한 동시성 테스트 시작 - 10명이 동시에 이벤트 참여" > $RESULTS_FILE
echo "이벤트 ID: $EVENT_ID" >> $RESULTS_FILE
echo "시작 시간: $(date)" >> $RESULTS_FILE
echo "==========================================" >> $RESULTS_FILE

# 먼저 이벤트 상태 초기화 (참여자 수를 0으로 리셋)
echo "📋 이벤트 상태 초기화 중..."
docker exec -it mymatchlog_mysql mysql -u root -pdbpassword -e "USE mymatchlog_dev; UPDATE events SET participant_count = 0 WHERE id = $EVENT_ID; DELETE FROM event_participations WHERE event_id = $EVENT_ID;"

echo "✅ 이벤트 초기화 완료"

# 기존 사용자들의 토큰을 사용 (이미 생성된 사용자들)
echo "👥 기존 사용자 토큰 사용..."

# 사용자 1 토큰
response1=$(curl -s -X POST $BASE_URL/api/users/login -H "Content-Type: application/json" -d '{"email": "test2@example.com", "password": "Password123!"}')
token1=$(echo $response1 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 사용자 2 토큰
response2=$(curl -s -X POST $BASE_URL/api/users/login -H "Content-Type: application/json" -d '{"email": "test3@example.com", "password": "Password123!"}')
token2=$(echo $response2 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 사용자 3 토큰
response3=$(curl -s -X POST $BASE_URL/api/users/login -H "Content-Type: application/json" -d '{"email": "test4@example.com", "password": "Password123!"}')
token3=$(echo $response3 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 사용자 4 토큰
response4=$(curl -s -X POST $BASE_URL/api/users/login -H "Content-Type: application/json" -d '{"email": "test5@example.com", "password": "Password123!"}')
token4=$(echo $response4 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 추가 사용자들 생성 (5-10번)
echo "👥 추가 사용자 생성 중..."

for i in {5..10}; do
    # 사용자 등록
    curl -s -X POST $BASE_URL/api/users/signup \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"concurrent_user_$i\", \"nickname\": \"동시테스트유저$i\", \"email\": \"concurrent$i@test.com\", \"password\": \"Password123!\"}" > /dev/null
    
    # 로그인하여 토큰 획득
    response=$(curl -s -X POST $BASE_URL/api/users/login \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"concurrent$i@test.com\", \"password\": \"Password123!\"}")
    
    # 토큰 추출
    token=$(echo $response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    eval "token$i=\$token"
    
    echo "사용자 $i 생성 완료"
done

echo "✅ 모든 토큰 준비 완료"

# 동시 요청 시작
echo "⚡ 동시 요청 시작 - 10명이 동시에 참여 시도..."

# 백그라운드에서 모든 요청을 동시에 실행
for i in {1..10}; do
    (
        token_var="token$i"
        token_value="${!token_var}"
        
        response=$(curl -s -X POST $BASE_URL/api/events/$EVENT_ID/participate \
            -H "Authorization: Bearer $token_value" \
            -w "\n%{http_code}")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        echo "사용자 $i: HTTP $http_code - $body" >> $RESULTS_FILE
    ) &
done

# 모든 백그라운드 프로세스 완료 대기
wait

echo "==========================================" >> $RESULTS_FILE
echo "종료 시간: $(date)" >> $RESULTS_FILE

# 결과 분석
echo "📊 Result analysis..."

success_count=$(grep -c "participationId" $RESULTS_FILE 2>/dev/null || echo "0")
capacity_exceeded_count=$(grep -c "EVENT_CAPACITY_EXCEEDED" $RESULTS_FILE 2>/dev/null || echo "0")
lock_failed_count=$(grep -c "락 획득 실패" $RESULTS_FILE 2>/dev/null || echo "0")
other_errors_count=$(grep -c "기타 오류" $RESULTS_FILE 2>/dev/null || echo "0")
max_retry_count=$(grep -c "최대 재시도 횟수 초과" $RESULTS_FILE 2>/dev/null || echo "0")

echo "==========================================" >> $RESULTS_FILE
echo "📈 Final Results:" >> $RESULTS_FILE
echo "Successful participations: $success_count" >> $RESULTS_FILE
echo "Capacity exceeded failures: $capacity_exceeded_count" >> $RESULTS_FILE
echo "Lock acquisition failures: $lock_failed_count" >> $RESULTS_FILE
echo "Other errors: $other_errors_count" >> $RESULTS_FILE
echo "Max retry exceeded: $max_retry_count" >> $RESULTS_FILE
echo "Total requests: 10" >> $RESULTS_FILE

# 이벤트 최종 상태 확인
final_status=$(curl -s -X GET $BASE_URL/api/events/$EVENT_ID)
echo "최종 이벤트 상태: $final_status" >> $RESULTS_FILE

echo "✅ 동시성 테스트 완료! 결과는 $RESULTS_FILE 파일을 확인하세요." 