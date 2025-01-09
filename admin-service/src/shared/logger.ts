import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logDirectory = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
    }),
  ],
});

export const logMessage = (
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  meta?: Record<string, any>,
) => {
  logger.log({ level, message, ...meta });
};

export default logger;
