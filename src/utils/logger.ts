import winston from 'winston';
import path from 'path';
import { config } from '../config/index.js';

// Define log levels with colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: false, level: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${String(timestamp)} [${level}]: ${String(message)}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// JSON format for file/production
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports in production
if (config.isProduction) {
  const logDir = path.resolve(process.cwd(), 'logs');

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: jsonFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: config.log.level,
  levels,
  transports,
});

// Stream for morgan integration
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
