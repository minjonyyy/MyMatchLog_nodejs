import request from 'supertest';
import { app } from '../app.js';

describe('App', () => {
  describe('GET /', () => {
    it('should return 200 for root path', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World!');
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // 데이터베이스 의존성이 있는 테스트는 제거
  // 실제 CI 환경에서는 데이터베이스가 설정되어 있을 때만 실행
}); 