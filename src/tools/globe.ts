import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllPanels } from "../style-system";
import { trackEvent } from "../analytics";

const globeToasts = [
  'No edges. Just Earth.',
  'The globe has no top',
  'Flat earthers look away',
  'Every projection lies. This doesn\'t.',
  'Borders look different from here',
];

const mercatorToasts = [
  'Back to Mercator',
  'Flattening the truth again',
  'Greenland is not that big',
];

export function setupToolGlobe(state: AppState): void {
  const btn = document.getElementById('tool-globe');
  if (!btn) return;

  btn.addEventListener('click', () => {
    closeAllPanels(state);
    state.isGlobe = !state.isGlobe;

    state.map.setProjection({ type: state.isGlobe ? 'globe' : 'mercator' });
    btn.innerHTML = state.isGlobe ? '&#x25CF;' : '&#x25CB;';
    btn.classList.toggle('active', state.isGlobe);

    // Smooth zoom: pull out to show globe, or zoom back in when leaving
    if (state.isGlobe && state.map.getZoom() > 4) {
      state.map.easeTo({ zoom: 2.5, duration: 1200, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    }

    // Notify dymaxion system to suppress
    state.onGlobeChange?.();

    trackEvent('globe', { enabled: state.isGlobe });
    const toasts = state.isGlobe ? globeToasts : mercatorToasts;
    showFlipToast(state, toasts[Math.floor(Math.random() * toasts.length)]);
  });
}
