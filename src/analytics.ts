import { inject, track } from '@vercel/analytics';
inject();

/**
 * Lightweight event tracking via Vercel Analytics.
 * Privacy-first: no cookies, no PII, no third-party scripts.
 * Events auto-batch and send on page unload.
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>): void {
  try {
    track(name, props);
  } catch {
    // Silently fail — analytics should never break the app
  }
}
