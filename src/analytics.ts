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

/** Track first-visit vs returning user (localStorage flag, no PII). */
export function trackVisitType(): void {
  const key = 'wud-visited';
  const isReturning = !!localStorage.getItem(key);
  trackEvent('visit', { returning: isReturning });
  if (!isReturning) localStorage.setItem(key, '1');
}

/* ── Orientation time tracking ── */
let orientationStart = Date.now();
let currentTrackedOrientation = 'upside-down';
const orientationTime: Record<string, number> = { 'upside-down': 0, 'normal': 0, 'mirrored': 0 };

export function trackOrientationChange(newOrientation: string): void {
  const now = Date.now();
  orientationTime[currentTrackedOrientation] = (orientationTime[currentTrackedOrientation] || 0) + (now - orientationStart);
  orientationStart = now;
  currentTrackedOrientation = newOrientation;
}

/* ── Globe duration tracking ── */
let globeStart: number | null = null;
let globeTotalMs = 0;

export function trackGlobeToggle(enabled: boolean): void {
  if (enabled) {
    globeStart = Date.now();
  } else if (globeStart) {
    globeTotalMs += Date.now() - globeStart;
    globeStart = null;
  }
}

/** Track session summary on page unload — flip count, last orientation, globe usage. */
export function trackSessionSummary(getState: () => {
  flipCount: number;
  orientation: string;
  isGlobe: boolean;
  currentCityName: string;
}): void {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    const s = getState();

    // Finalize orientation timing
    orientationTime[currentTrackedOrientation] = (orientationTime[currentTrackedOrientation] || 0) + (Date.now() - orientationStart);

    // Finalize globe timing
    if (globeStart) {
      globeTotalMs += Date.now() - globeStart;
      globeStart = null;
    }

    trackEvent('session_summary', {
      flips: s.flipCount,
      last_orientation: s.orientation,
      globe_used: s.isGlobe,
      globe_seconds: Math.round(globeTotalMs / 1000),
      time_upside_down_s: Math.round((orientationTime['upside-down'] || 0) / 1000),
      time_normal_s: Math.round((orientationTime['normal'] || 0) / 1000),
      time_mirrored_s: Math.round((orientationTime['mirrored'] || 0) / 1000),
      last_city: s.currentCityName || 'none',
    });
  });
}
