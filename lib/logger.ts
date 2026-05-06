import * as Sentry from "@sentry/nextjs";

type LogContext = Record<string, unknown> | undefined;

const TAG_KEYS = ["status", "code", "url", "method", "request_id"] as const;

function extractTags(context: LogContext): Record<string, string> {
  const tags: Record<string, string> = {};
  if (!context) return tags;
  for (const key of TAG_KEYS) {
    const value = context[key];
    if (value !== undefined && value !== null) {
      tags[key] = String(value);
    }
  }
  return tags;
}

function captureAsIssue(level: "error" | "fatal", message: string, context: LogContext): void {
  const tags = extractTags(context);
  const candidate = context?.error;
  const err = candidate instanceof Error ? candidate : undefined;
  if (err) {
    Sentry.captureException(err, { level, tags, extra: { message, ...context } });
    return;
  }
  Sentry.captureMessage(message, { level, tags, extra: context });
}

export const logger = {
  trace: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.trace(message, context),
  debug: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    Sentry.logger.warn(message, context),
  error: (message: string, context?: Record<string, unknown>) => {
    Sentry.logger.error(message, context);
    captureAsIssue("error", message, context);
  },
  fatal: (message: string, context?: Record<string, unknown>) => {
    Sentry.logger.fatal(message, context);
    captureAsIssue("fatal", message, context);
  },
};
