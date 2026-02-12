import type { AppState } from "./map-state";
import { generateTickerPhrase } from "./font-system";

export function setupTicker(state: AppState): void {
  const tickerEl = document.getElementById('ticker');
  if (!tickerEl) return;
  const el = tickerEl;

  function updateTicker() {
    const place = state.currentCityName;
    if (!place) return;

    const phrase = generateTickerPhrase(place, state.fontState);
    if (!phrase) return;

    const template = state.fontState.tickerPhrase;
    const parts = template.split('[place]');
    el.innerHTML = parts[0] + `<span class="ticker-place-name">${place}</span>` + (parts[1] || '');

    el.classList.remove('ticker--east', 'ticker--west', 'visible');
    void el.offsetWidth;

    const dir = state.fontState.tickerDirection;
    const charCount = phrase.length;
    const duration = Math.max(8, Math.min(20, charCount * 0.5));
    el.style.animationDuration = `${duration}s`;
    el.classList.add(`ticker--${dir}`, 'visible');

    el.addEventListener('animationend', () => {
      el.classList.remove('visible');
    }, { once: true });
  }

  state.map.on('moveend', () => {
    if (state.tickerTimeout) clearTimeout(state.tickerTimeout);
    state.tickerTimeout = setTimeout(() => {
      if (state.currentMode !== 'explore') return;
      updateTicker();
    }, 1500);

    if (state.tickerIdleTimeout) clearTimeout(state.tickerIdleTimeout);
    state.tickerIdleTimeout = setTimeout(() => {
      state.fontState.tickerPaused = true;
    }, 30000);
    state.fontState.tickerPaused = false;
  });
}
