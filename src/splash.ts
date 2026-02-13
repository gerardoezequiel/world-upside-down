/* ══════════════════════════════════════════════════════════════
   Splash Screen — first-visit intro overlay
   ══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'wud-splash-seen';

function hasLocationData(): boolean {
  const hash = window.location.hash;
  // If the hash contains lat/lon coordinates (e.g. #12/51.5/-0.1/180) skip splash
  return /^#[\d.]+\/[-\d.]+\/[-\d.]+/.test(hash);
}

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch { /* ignore */ }
}

/** Set up the splash screen. Call before map init. Returns true if splash is shown. */
export function setupSplash(): boolean {
  const splash = document.getElementById('splash');
  if (!splash) return false;

  // Skip splash for returning visitors or shared URLs
  if (alreadySeen() || hasLocationData()) {
    splash.remove();
    return false;
  }

  // Show splash
  splash.classList.add('visible');

  const enterBtn = document.getElementById('splash-enter');

  const el = splash; // bind for closure

  function dismiss() {
    el.classList.add('fade-out');
    markSeen();
    el.addEventListener('transitionend', () => {
      el.remove();
    }, { once: true });
    // Safety fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 1200);
  }

  enterBtn?.addEventListener('click', dismiss);

  // Also dismiss on any key press
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      dismiss();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);

  return true;
}
