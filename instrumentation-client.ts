import * as Sentry from "@sentry/nextjs";
import { scrubAuthFromSentryEvent } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  // Strip request headers + auth credentials (e.g. x-auth-token) from every
  // event before it leaves the client. See SECURITY_FINDINGS.md #1.
  beforeSend: scrubAuthFromSentryEvent,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false,
    }),
    // SECURITY NOTE (console capture & PII — no client fix needed): these
    // integrations ship console output to Sentry, which could carry PII if
    // someone logs a raw object. No fix is applied because current call sites
    // log only structured, field-whitelisted data (see services/api.ts and
    // lib/logger.ts) and replays already mask all text/inputs. The standing
    // rule is to keep logs structured and never log raw payload objects.
    Sentry.consoleLoggingIntegration({ levels: ["info", "warn"] }),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
