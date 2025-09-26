const request = require('supertest');
const app = require('../server');

describe('Forecasting Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('healthy');
    });
  });

  describe('GET /predict', () => {
    it('should return prediction for valid route and date', async () => {
      const response = await request(app)
        .get('/predict')
        .query({
          route: 'Central Station to Airport Express',
          date: '2024-01-15',
          hour: 9
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('route');
      expect(response.body.data).toHaveProperty('predicted_count');
      expect(response.body.data).toHaveProperty('capacity');
      expect(response.body.data).toHaveProperty('utilization_pct');
      expect(response.body.data).toHaveProperty('confidence');
    });

    it('should return error for missing route parameter', async () => {
      const response = await request(app)
        .get('/predict')
        .query({
          date: '2024-01-15'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Route and date are required');
    });

    it('should return error for missing date parameter', async () => {
      const response = await request(app)
        .get('/predict')
        .query({
          route: 'Central Station to Airport Express'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Route and date are required');
    });
  });

  describe('GET /routes/:routeId/analytics', () => {
    it('should return analytics for valid route', async () => {
      const response = await request(app)
        .get('/routes/test-route/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('routeId');
      expect(response.body.data).toHaveProperty('utilization');
      expect(response.body.data).toHaveProperty('heatmap');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });
});
