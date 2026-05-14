import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["info", "warn"] }),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
