// Jest 테스트 환경 설정
import dotenv from 'dotenv';

// 테스트용 환경변수 로드
dotenv.config({ path: '.env.test' });

// 글로벌 테스트 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 숨기기
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 테스트 후 정리
afterEach(() => {
  jest.clearAllMocks();
}); 