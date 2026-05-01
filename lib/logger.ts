import * as Sentry from "@sentry/nextjs";

export const logger = {
  trace: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.trace(message, context),
  debug: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.warn(message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    Sentry.captureMessage(message, { level: "error", extra: context }),
  fatal: (message: string, context?: Record<string, unknown>) =>
    Sentry.captureMessage(message, { level: "fatal", extra: context }),
};
