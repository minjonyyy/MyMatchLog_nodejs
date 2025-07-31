export default {
  // ES 모듈 지원
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // ES 모듈 변환 설정
  transform: {},
  transformIgnorePatterns: [
    'node_modules/(?!(dotenv|supertest)/)'
  ],
  
  // 테스트 환경 설정
  testEnvironment: 'node',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // 테스트 제외 패턴
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // 수집할 파일 패턴
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/db/migration.js',
    '!src/db/seeding.js',
    '!src/app.js'
  ],
  
  // 커버리지 설정
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 2,
      lines: 2,
      statements: 2
    }
  },
  
  // 테스트 타임아웃
  testTimeout: 10000,
  
  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}; 