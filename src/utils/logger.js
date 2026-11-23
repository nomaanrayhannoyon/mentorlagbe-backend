import pino from 'pino';

// Create a pino logger instance with pretty printing for development.
// pino-pretty is optional; fall back to the default transport when absent.
let transport;
if (process.env.NODE_ENV !== 'production') {
  try {
    require.resolve('pino-pretty');
    transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    };
  } catch {
    transport = undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(transport ? { transport } : {}),
});

export default logger;
