import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { config } from './config/index.js';
import { morganStream, logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimiter.middleware.js';
import routes from './routes/index.js';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app = express();

  // ==========================================================================
  // Security Middleware
  // ==========================================================================

  // Set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction ? undefined : false,
    })
  );

  // Enable CORS
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ==========================================================================
  // Parsing & Compression Middleware
  // ==========================================================================

  // Parse JSON bodies
  app.use(express.json({ limit: '10kb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Compress responses
  app.use(compression());

  // ==========================================================================
  // Logging Middleware
  // ==========================================================================

  // HTTP request logging
  const morganFormat = config.isDevelopment ? 'dev' : 'combined';
  app.use(morgan(morganFormat, { stream: morganStream }));

  // ==========================================================================
  // Rate Limiting
  // ==========================================================================

  // Apply general rate limit to all requests
  app.use(generalLimiter);

  // ==========================================================================
  // API Documentation (Swagger)
  // ==========================================================================

  if (config.isDevelopment) {
    const swaggerOptions: swaggerJsdoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Express TypeScript API',
          version: '1.0.0',
          description: 'Production-ready Express TypeScript REST API',
        },
        servers: [
          {
            url: `http://localhost:${config.port}/api`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/routes/**/*.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    logger.info(`📚 Swagger docs available at http://localhost:${config.port}/docs`);
  }

  // ==========================================================================
  // API Routes
  // ==========================================================================

  app.use('/api', routes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Express TypeScript API',
      version: '1.0.0',
      docs: config.isDevelopment ? '/docs' : undefined,
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  // 404 handler (after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  return app;
};
