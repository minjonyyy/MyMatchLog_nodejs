import request from 'supertest';
import { app } from '../app.js';

describe('App', () => {
  describe('GET /', () => {
    it('should return 404 for root path', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/teams', () => {
    it('should return teams list', async () => {
      const response = await request(app).get('/api/teams');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('teams');
      expect(Array.isArray(response.body.data.teams)).toBe(true);
    });
  });

  describe('GET /api/stadiums', () => {
    it('should return stadiums list', async () => {
      const response = await request(app).get('/api/stadiums');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('stadiums');
      expect(Array.isArray(response.body.data.stadiums)).toBe(true);
    });
  });
}); 