/* ══════════════════════════════════════════════════════════════
   3D Pitch Toggle — tilt the map between 0° and 55°
   ══════════════════════════════════════════════════════════════ */
import type { AppState } from "../map-state";

export function setupToolPitch(state: AppState): void {
  const btn = document.getElementById('tool-pitch');
  if (!btn) return;

  function updateState() {
    const pitched = state.map.getPitch() > 10;
    btn!.classList.toggle('active', pitched);
  }

  btn.addEventListener('click', () => {
    const target = state.map.getPitch() > 10 ? 0 : 55;
    state.map.easeTo({ pitch: target, duration: 800 });
  });

  state.map.on('pitchend', updateState);
}
