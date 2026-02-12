import type { AppState } from "../map-state";
import { setMode } from "../mode-system";
import { showFlipToast } from "../orientation";
import { closeAllPanels } from "../style-system";
import { updateScreenprintText } from "./title";

export function setupToolLocate(state: AppState): void {
  const btn = document.getElementById('tool-locate');
  if (!btn) return;

  btn.addEventListener('click', () => {
    closeAllPanels(state);

    if (!navigator.geolocation) {
      showFlipToast(state, "Couldn't find you — try searching instead");
      return;
    }

    showFlipToast(state, "Finding you...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        state.map.flyTo({
          center: [lon, lat], zoom: 13,
          bearing: state.orientation === 'upside-down' ? 180 : 0,
          duration: 2000,
        });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=14&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'world-upside-down/1.0' } }
          );
          const data = await res.json();
          const addr = data.address;
          const name = addr?.city || addr?.town || addr?.village || addr?.state || addr?.country || 'Here';

          const titleEl = document.getElementById('city-title');
          if (titleEl) titleEl.textContent = name;
          state.currentCityName = name;

          updateScreenprintText(name);
          state.hasCustomTitle = true;

          setTimeout(() => setMode(state, 'poster'), 500);
          setTimeout(() => showFlipToast(state, `${name}, upside down`), 2600);
        } catch {
          setMode(state, 'poster');
        }
      },
      () => {
        showFlipToast(state, "Couldn't find you — try searching instead");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
