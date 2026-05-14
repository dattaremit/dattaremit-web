import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.SENTRY_RELEASE || undefined,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["info", "warn"] }),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});
