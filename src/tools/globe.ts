import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllPanels } from "../style-system";

export function setupToolGlobe(state: AppState): void {
  const btn = document.getElementById('tool-globe');
  if (!btn) return;

  btn.addEventListener('click', () => {
    closeAllPanels(state);
    state.isGlobe = !state.isGlobe;

    state.map.setProjection({ type: state.isGlobe ? 'globe' : 'mercator' });
    btn.innerHTML = state.isGlobe ? '&#x25CF;' : '&#x25CB;';
    btn.classList.toggle('active', state.isGlobe);

    showFlipToast(state, state.isGlobe ? 'No edges. Just Earth.' : 'Back to Mercator');
  });
}
