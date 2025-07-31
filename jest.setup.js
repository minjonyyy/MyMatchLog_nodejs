// Jest 테스트 환경 설정
const dotenv = require('dotenv');

// 테스트용 환경변수 로드
dotenv.config({ path: '.env.test' });

// 전역 함수 선언
/* global setTimeout */

// 테스트 타임아웃 설정
setTimeout(() => {}, 10000);

// 테스트 후 정리
afterAll(async () => {
  // 모든 비동기 작업이 완료될 때까지 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 100));
});
