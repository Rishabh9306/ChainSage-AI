import winston from 'winston';
import { config } from './config';

/**
 * Logger utility for ChainSage AI
 */
class Logger {
  private logger: winston.Logger;

  constructor() {
    const loggingConfig = config.getLoggingConfig();

    this.logger = winston.createLogger({
      level: loggingConfig.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });

    if (loggingConfig.outputFile) {
      this.logger.add(
        new winston.transports.File({
          filename: loggingConfig.outputFile,
        })
      );
    }
  }

  /**
   * Log info message
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack });
    } else {
      this.logger.error(message, { error });
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug message
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log trace data
   */
  public trace(data: any): void {
    this.logger.debug('Trace:', data);
  }
}

/**
 * Export singleton instance
 */
export const logger = new Logger();
