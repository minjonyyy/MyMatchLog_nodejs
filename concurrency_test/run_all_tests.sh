#!/bin/bash

# 모든 동시성 테스트를 순차적으로 실행하는 스크립트

echo "🚀 동시성 테스트 스위트 시작"
echo "=========================================="

# 결과 디렉토리 생성
mkdir -p concurrency_test/results

# 1. 간단한 동시성 테스트 (10명)
echo "📋 1단계: 간단한 동시성 테스트 (10명) 실행 중..."
./concurrency_test/simple_concurrency_test.sh
echo "✅ 간단한 동시성 테스트 완료"
echo ""

# 잠시 대기
sleep 2

# 2. 재시도 로직이 포함된 동시성 테스트 (10명)
echo "📋 2단계: 재시도 로직이 포함된 동시성 테스트 (10명) 실행 중..."
./concurrency_test/retry_concurrency_test.sh
echo "✅ 재시도 동시성 테스트 완료"
echo ""

# 잠시 대기
sleep 2

# 3. 대규모 동시성 테스트 (100명) - 선택적 실행
echo "📋 3단계: 대규모 동시성 테스트 (100명) 실행 중..."
echo "⚠️  이 테스트는 시간이 오래 걸릴 수 있습니다. 계속하시겠습니까? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    ./concurrency_test/concurrency_test.sh
    echo "✅ 대규모 동시성 테스트 완료"
else
    echo "⏭️  대규모 동시성 테스트 건너뜀"
fi

echo ""
echo "=========================================="
echo "🎉 모든 동시성 테스트 완료!"
echo "📁 결과 파일 위치: concurrency_test/results/"
echo ""
echo "📊 결과 파일 목록:"
ls -la concurrency_test/results/
echo ""
echo "📖 결과 확인 명령어:"
echo "  cat concurrency_test/results/simple_concurrency_results.txt"
echo "  cat concurrency_test/results/retry_concurrency_results.txt"
echo "  cat concurrency_test/results/concurrency_results.txt" 