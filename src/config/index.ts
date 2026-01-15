import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper function to get required env variable
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Helper function to get number env variable
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config = {
  // Server
  env: getEnvVar('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 5000),
  host: getEnvVar('HOST', '0.0.0.0'),
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',

  // Database
  databaseUrl: getEnvVar('DATABASE_URL'),

  // JWT
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    accessTokenExpiresIn: getEnvVar('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
    refreshTokenExpiresIn: getEnvVar('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
  },

  // CORS
  cors: {
    origins: getEnvVar('CORS_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    authMaxRequests: getEnvNumber('RATE_LIMIT_AUTH_MAX_REQUESTS', 10),
  },

  // Logging
  log: {
    level: getEnvVar('LOG_LEVEL', 'info'),
  },
} as const;

export type Config = typeof config;
