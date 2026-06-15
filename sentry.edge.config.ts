import * as Sentry from "@sentry/nextjs";
import { scrubAuthFromSentryEvent } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.SENTRY_RELEASE || undefined,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  // Strip request headers + auth credentials (e.g. x-auth-token) from every
  // event before it leaves the edge runtime. See SECURITY_FINDINGS.md #1.
  beforeSend: scrubAuthFromSentryEvent,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["info", "warn"] }),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});
