import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { prisma } from './db/prisma.js';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, config.host, () => {
      logger.info(`🚀 Server running on http://${config.host}:${config.port}`);
      logger.info(`📍 Environment: ${config.env}`);

      if (config.isDevelopment) {
        logger.info(`📚 API Docs: http://localhost:${config.port}/docs`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('✅ HTTP server closed');

        prisma
          .$disconnect()
          .then(() => {
            logger.info('✅ Database connection closed');
            process.exit(0);
          })
          .catch((error: unknown) => {
            logger.error('❌ Error during shutdown:', error);
            process.exit(1);
          });
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
void startServer();
