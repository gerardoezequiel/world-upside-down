/* ══════════════════════════════════════════════════════════════
   Onboarding — 4-step tooltip-based guided tour
   ══════════════════════════════════════════════════════════════ */
import type { AppState } from "./map-state";
import { trackEvent } from "./analytics";

const STORAGE_KEY = 'wud-onboarded';

interface OnboardingState {
  step: number; // 0 = not started, 1..4 = steps, 5 = done
}

function getState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { step: 0 };
}

function saveState(s: OnboardingState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

/* ── Tooltip component ─────────────────────────────────────── */
let activeTooltip: HTMLElement | null = null;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

interface TooltipOptions {
  target: HTMLElement;
  text: string;
  stepNumber: number;
  totalSteps: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
  onSkip: () => void;
}

function showTooltip(opts: TooltipOptions): void {
  dismissTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = `onboarding-tooltip onboarding-tooltip--${opts.position || 'bottom'}`;

  tooltip.innerHTML = `
    <div class="onboarding-tooltip-text">${opts.text}</div>
    <div class="onboarding-tooltip-footer">
      <span class="onboarding-tooltip-dots">${Array.from({ length: opts.totalSteps }, (_, i) =>
        `<span class="onboarding-dot${i + 1 === opts.stepNumber ? ' active' : ''}"></span>`
      ).join('')}</span>
      <button class="onboarding-tooltip-btn">Got it</button>
      <button class="onboarding-tooltip-skip">Skip tour</button>
    </div>
  `;

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;

  // Position relative to target
  positionTooltip(tooltip, opts.target, opts.position || 'bottom');

  // Button handlers
  tooltip.querySelector('.onboarding-tooltip-btn')?.addEventListener('click', () => {
    opts.onDismiss();
    dismissTooltip();
  });

  tooltip.querySelector('.onboarding-tooltip-skip')?.addEventListener('click', () => {
    opts.onSkip();
    dismissTooltip();
  });

  // Auto-dismiss after 8s
  autoDismissTimer = setTimeout(() => {
    opts.onDismiss();
    dismissTooltip();
  }, 8000);
}

function positionTooltip(tooltip: HTMLElement, target: HTMLElement, position: string): void {
  const rect = target.getBoundingClientRect();
  const gap = 12;

  // Let it render first to get dimensions
  requestAnimationFrame(() => {
    const ttRect = tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - ttRect.width / 2;
        break;
      case 'top':
        top = rect.top - ttRect.height - gap;
        left = rect.left + rect.width / 2 - ttRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - ttRect.height / 2;
        left = rect.left - ttRect.width - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - ttRect.height / 2;
        left = rect.right + gap;
        break;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - ttRect.height - 8));

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.opacity = '1';
  });
}

function dismissTooltip(): void {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

/* ── Onboarding flow ───────────────────────────────────────── */
export function setupOnboarding(state: AppState): void {
  const ob = getState();
  if (ob.step >= 5) return; // Already completed

  // If splash is showing, wait for it to dismiss before starting
  const splash = document.getElementById('splash');
  if (splash) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById('splash')) {
        observer.disconnect();
        startFlow(state, ob);
      }
    });
    observer.observe(document.body, { childList: true });
    // Fallback timeout
    setTimeout(() => { observer.disconnect(); startFlow(state, ob); }, 30000);
  } else {
    startFlow(state, ob);
  }
}

function startFlow(state: AppState, ob: OnboardingState): void {
  const totalSteps = 4;

  function skipAll() {
    ob.step = 5;
    saveState(ob);
    trackEvent('onboarding', { step: 'skipped' });
  }

  // Step 1: Map interaction hint — after splash dismisses
  if (ob.step < 1) {
    setTimeout(() => {
      const mapFrame = document.getElementById('map-frame');
      if (!mapFrame) return;

      showTooltip({
        target: mapFrame,
        text: 'Drag to explore. The world is upside down.',
        stepNumber: 1,
        totalSteps,
        position: 'top',
        onDismiss: () => {
          ob.step = 1;
          saveState(ob);
          trackEvent('onboarding', { step: 'map-hint' });
          waitForStep2(state, ob, totalSteps, skipAll);
        },
        onSkip: skipAll,
      });
    }, 1500);
  } else if (ob.step < 2) {
    waitForStep2(state, ob, totalSteps, skipAll);
  } else if (ob.step < 3) {
    waitForStep3(state, ob, totalSteps, skipAll);
  } else if (ob.step < 4) {
    showStep4(state, ob, totalSteps, skipAll);
  }
}

function waitForStep2(state: AppState, ob: OnboardingState, totalSteps: number, skipAll: () => void): void {
  // Step 2: After first drag, hint about flip
  state.map.once('moveend', () => {
    setTimeout(() => {
      const flipFab = document.getElementById('flip-fab');
      const flipHint = document.getElementById('flip-hint');
      const target = flipFab && window.innerWidth <= 768 ? flipFab : flipHint || document.getElementById('map-frame')!;

      showTooltip({
        target,
        text: 'Tap to flip orientation',
        stepNumber: 2,
        totalSteps,
        position: window.innerWidth <= 768 ? 'top' : 'bottom',
        onDismiss: () => {
          ob.step = 2;
          saveState(ob);
          trackEvent('onboarding', { step: 'flip-hint' });
          waitForStep3(state, ob, totalSteps, skipAll);
        },
        onSkip: skipAll,
      });
    }, 2000);
  });
}

function waitForStep3(state: AppState, ob: OnboardingState, totalSteps: number, skipAll: () => void): void {
  // Step 3: After first flip, hint about style
  const origOrientation = state.orientation;
  const checkFlip = setInterval(() => {
    if (state.orientation !== origOrientation) {
      clearInterval(checkFlip);
      setTimeout(() => {
        const styleBtn = document.getElementById('tool-style');
        if (!styleBtn) return;

        showTooltip({
          target: styleBtn,
          text: 'Try different styles',
          stepNumber: 3,
          totalSteps,
          position: 'bottom',
          onDismiss: () => {
            ob.step = 3;
            saveState(ob);
            trackEvent('onboarding', { step: 'style-hint' });
            showStep4(state, ob, totalSteps, skipAll);
          },
          onSkip: skipAll,
        });
      }, 3000);
    }
  }, 1000);

  // Give up after 60s
  setTimeout(() => {
    clearInterval(checkFlip);
    if (ob.step < 3) {
      showStep4(state, ob, totalSteps, skipAll);
    }
  }, 60000);
}

function showStep4(_state: AppState, ob: OnboardingState, totalSteps: number, skipAll: () => void): void {
  // Step 4: Search hint
  setTimeout(() => {
    const title = document.getElementById('city-title');
    if (!title) return;

    showTooltip({
      target: title,
      text: 'Search any city',
      stepNumber: 4,
      totalSteps,
      position: 'bottom',
      onDismiss: () => {
        ob.step = 5;
        saveState(ob);
        trackEvent('onboarding', { step: 'search-hint' });
      },
      onSkip: skipAll,
    });
  }, 2000);
}

/** Replay onboarding from step 1 */
export function replayOnboarding(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
