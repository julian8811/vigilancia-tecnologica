import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  
  // Use pretty printing in development
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),

  // Timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
})

// Request logging helper
export function createRequestLogger() {
  return logger.child({ module: 'request' })
}

// Database logging helper  
export function createDbLogger() {
  return logger.child({ module: 'database' })
}

// Worker logging helper
export function createWorkerLogger(workerName: string) {
  return logger.child({ module: 'worker', worker: workerName })
}

// Export default logger
export default logger