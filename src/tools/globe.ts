import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllPanels } from "../style-system";
import { trackEvent, trackGlobeToggle } from "../analytics";

const globeToasts = [
  'No edges. Just Earth.',
  'The globe has no top',
  'Flat earthers look away',
  'Every projection lies. This doesn\'t.',
  'Borders look different from here',
  'Drag to spin the globe',
  'No north, no south. Just a sphere.',
  'The world without edges',
];

const mercatorToasts = [
  'Back to Mercator',
  'Flattening the truth again',
  'Greenland is not that big',
  'Back to the flat lie',
  'Mercator wins this round',
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
    btn.title = state.isGlobe ? 'Globe mode (active)' : 'Globe mode';

    // Smooth zoom: pull out to show globe, or zoom back in when leaving
    if (state.isGlobe && state.map.getZoom() > 4) {
      showFlipToast(state, 'Zooming out to see the globe...');
      state.map.easeTo({ zoom: 2.5, duration: 1200, easing: (t: number) => 1 - Math.pow(1 - t, 3) });

      // After zoom completes, show a follow-up toast
      setTimeout(() => {
        const toasts = globeToasts;
        showFlipToast(state, toasts[Math.floor(Math.random() * toasts.length)]);
      }, 2800);
    } else {
      const toasts = state.isGlobe ? globeToasts : mercatorToasts;
      showFlipToast(state, toasts[Math.floor(Math.random() * toasts.length)]);
    }

    // Notify dymaxion system to suppress
    state.onGlobeChange?.();

    trackGlobeToggle(state.isGlobe);
    trackEvent('globe', { enabled: state.isGlobe });
  });
}
