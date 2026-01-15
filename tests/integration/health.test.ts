import request from 'supertest';
import { createApp } from '../../src/app';
import { Express } from 'express';

describe('Health Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/v1/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });
  });
});
