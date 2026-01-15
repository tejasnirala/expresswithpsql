import { Router, IRouter, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { prisma } from '../../db/prisma.js';
import { config } from '../../config/index.js';

const router: IRouter = Router();

/**
 * GET /api/v1/health
 * Basic health check
 */
router.get('/', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.env,
    },
    'Service is healthy'
  );
});

/**
 * GET /api/v1/health/ready
 * Readiness check (includes database)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    sendSuccess(
      res,
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      'Service is ready'
    );
  } catch {
    res.status(503).json({
      success: false,
      message: 'Service not ready',
      data: {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
    });
  }
});

export default router;
