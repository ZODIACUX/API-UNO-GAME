const winston = require('winston')
const path = require('path')

/**
 * Logger Service - Error Logging System
 * Implements SRP (Single Responsibility Principle)
 * Handles all logging operations with Winston
 */
class LoggerService {
  constructor() {
    this.logger = null
    this.initializeLogger()
  }

  /**
   * Initialize Winston logger with multiple transports
   */
  initializeLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`

        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`
        }

        if (stack) {
          log += `\n${stack}`
        }

        return log
      })
    )

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'uno-game-api' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            logFormat
          )
        }),

        // File transport for all logs
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'app.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Separate file for errors
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Separate file for warnings
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'warn.log'),
          level: 'warn',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      ],

      // Handle exceptions and rejections
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'exceptions.log')
        })
      ],

      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'rejections.log')
        })
      ]
    })

    // Create logs directory if it doesn't exist
    this.ensureLogsDirectory()
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogsDirectory() {
    const fs = require('fs')
    const path = require('path')
    const logsDir = path.join(process.cwd(), 'logs')

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
  }

  /**
   * Log info level message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, meta)
  }

  /**
   * Log warning level message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta)
  }

  /**
   * Log error level message
   * @param {string} message - Log message
   * @param {Error} error - Error object
   * @param {Object} meta - Additional metadata
   */
  error(message, error = null, meta = {}) {
    const logData = { ...meta }

    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }

    this.logger.error(message, logData)
  }

  /**
   * Log debug level message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta)
  }

  /**
   * Log API request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in ms
   */
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    }

    if (res.statusCode >= 400) {
      this.warn(`API Request: ${req.method} ${req.url}`, meta)
    } else {
      this.info(`API Request: ${req.method} ${req.url}`, meta)
    }
  }

  /**
   * Log game action
   * @param {number} gameId - Game ID
   * @param {number} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} details - Action details
   */
  logGameAction(gameId, userId, action, details = {}) {
    this.info(`Game Action: ${action}`, {
      gameId,
      userId,
      action,
      ...details
    })
  }

  /**
   * Log authentication event
   * @param {string} event - Auth event type
   * @param {number} userId - User ID
   * @param {boolean} success - Success status
   * @param {Object} details - Additional details
   */
  logAuthEvent(event, userId, success, details = {}) {
    const level = success ? 'info' : 'warn'
    const message = `Auth ${event}: ${success ? 'Success' : 'Failed'}`

    this.logger.log(level, message, {
      event,
      userId,
      success,
      ...details
    })
  }

  /**
   * Log database operation
   * @param {string} operation - DB operation type
   * @param {string} table - Table name
   * @param {boolean} success - Success status
   * @param {Object} details - Operation details
   */
  logDatabaseOperation(operation, table, success, details = {}) {
    const level = success ? 'debug' : 'error'
    const message = `DB ${operation}: ${table}`

    this.logger.log(level, message, {
      operation,
      table,
      success,
      ...details
    })
  }

  /**
   * Log WebSocket event
   * @param {string} event - WS event type
   * @param {number} userId - User ID
   * @param {number} gameId - Game ID
   * @param {Object} details - Event details
   */
  logWebSocketEvent(event, userId, gameId, details = {}) {
    this.info(`WebSocket ${event}`, {
      event,
      userId,
      gameId,
      ...details
    })
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {Object} details - Additional details
   */
  logPerformance(operation, duration, details = {}) {
    const level = duration > 1000 ? 'warn' : 'debug'
    const message = `Performance: ${operation}`

    this.logger.log(level, message, {
      operation,
      duration: `${duration}ms`,
      ...details
    })
  }

  /**
   * Log security event
   * @param {string} event - Security event type
   * @param {number} userId - User ID
   * @param {string} severity - Event severity
   * @param {Object} details - Event details
   */
  logSecurityEvent(event, userId, severity = 'info', details = {}) {
    const message = `Security: ${event}`

    this.logger.log(severity, message, {
      event,
      userId,
      severity,
      ...details
    })
  }

  /**
   * Create child logger with additional context
   * @param {Object} context - Context metadata
   * @returns {Object} Child logger instance
   */
  child(context) {
    return {
      info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
      error: (message, error = null, meta = {}) => this.error(message, error, { ...context, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
      logRequest: (req, res, responseTime) => this.logRequest(req, res, responseTime),
      logGameAction: (gameId, userId, action, details = {}) =>
        this.logGameAction(gameId, userId, action, { ...context, ...details }),
      logAuthEvent: (event, userId, success, details = {}) =>
        this.logAuthEvent(event, userId, success, { ...context, ...details }),
      logDatabaseOperation: (operation, table, success, details = {}) =>
        this.logDatabaseOperation(operation, table, success, { ...context, ...details }),
      logWebSocketEvent: (event, userId, gameId, details = {}) =>
        this.logWebSocketEvent(event, userId, gameId, { ...context, ...details }),
      logPerformance: (operation, duration, details = {}) =>
        this.logPerformance(operation, duration, { ...context, ...details }),
      logSecurityEvent: (event, userId, severity = 'info', details = {}) =>
        this.logSecurityEvent(event, userId, severity, { ...context, ...details })
    }
  }

  /**
   * Flush all pending logs
   */
  flush() {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve)
      this.logger.end()
    })
  }

  /**
   * Get logger statistics
   * @returns {Object} Logger statistics
   */
  getStats() {
    return {
      level: this.logger.level,
      transports: this.logger.transports.length,
      service: 'uno-game-api'
    }
  }
}

// Create singleton instance
const loggerService = new LoggerService()

module.exports = loggerService
