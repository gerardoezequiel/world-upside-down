import type { AppState } from "./map-state";

export function updateCityTitle(state: AppState): void {
  if (state.geocodeTimeout) clearTimeout(state.geocodeTimeout);
  state.geocodeTimeout = setTimeout(async () => {
    const map = state.map;
    const ctr = map.getCenter();
    const z = map.getZoom();
    const titleEl = document.getElementById('city-title');
    if (!titleEl) return;

    if (z < 5) {
      titleEl.textContent = 'Upside Down';
      state.currentCityName = '';
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${ctr.lat}&lon=${ctr.lng}&zoom=${Math.min(Math.round(z), 14)}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'world-upside-down/1.0' } }
      );
      const data = await res.json();
      const addr = data.address;
      const name = addr?.city || addr?.town || addr?.village || addr?.state || addr?.country || '';
      if (name) {
        titleEl.textContent = name;
        state.currentCityName = name;
      }
    } catch {
      // Silently fail
    }
  }, 800);
}

export function setupGeocoder(state: AppState): void {
  const titleEl = document.getElementById('city-title')!;
  const geocoderEl = document.getElementById('geocoder')!;
  const inputEl = document.getElementById('geocoder-input') as HTMLInputElement;
  const resultsEl = document.getElementById('geocoder-results')!;

  function openGeocoder() {
    titleEl.style.display = 'none';
    geocoderEl.classList.add('open');
    inputEl.value = '';
    inputEl.focus();
    resultsEl.innerHTML = '';
    resultsEl.classList.remove('has-results');
  }

  function closeGeocoder() {
    geocoderEl.classList.remove('open');
    titleEl.style.display = '';
    resultsEl.innerHTML = '';
    resultsEl.classList.remove('has-results');
    if (state.searchTimeout) clearTimeout(state.searchTimeout);
  }

  titleEl.addEventListener('click', openGeocoder);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGeocoder();
  });

  document.addEventListener('click', (e) => {
    if (geocoderEl.classList.contains('open') &&
        !geocoderEl.contains(e.target as Node) &&
        e.target !== titleEl) {
      closeGeocoder();
    }
  });

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim();
    if (state.searchTimeout) clearTimeout(state.searchTimeout);

    if (q.length < 2) {
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('has-results');
      return;
    }

    state.searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=en`,
          { headers: { 'User-Agent': 'world-upside-down/1.0' } }
        );
        const results = await res.json();

        resultsEl.innerHTML = '';
        if (results.length === 0) {
          resultsEl.classList.remove('has-results');
          return;
        }

        resultsEl.classList.add('has-results');

        for (const r of results) {
          const item = document.createElement('div');
          item.className = 'geocoder-result';

          const parts = (r.display_name as string).split(', ');
          const name = parts[0];
          const detail = parts.slice(1).join(', ');

          const nameSpan = document.createElement('span');
          nameSpan.className = 'geocoder-result-name';
          nameSpan.textContent = name;
          const detailSpan = document.createElement('span');
          detailSpan.className = 'geocoder-result-detail';
          detailSpan.textContent = detail;
          item.appendChild(nameSpan);
          item.appendChild(detailSpan);

          item.addEventListener('click', () => {
            const lat = parseFloat(r.lat);
            const lon = parseFloat(r.lon);
            const bbox = r.boundingbox;

            if (bbox) {
              const sw: [number, number] = [parseFloat(bbox[2]), parseFloat(bbox[0])];
              const ne: [number, number] = [parseFloat(bbox[3]), parseFloat(bbox[1])];
              state.map.fitBounds([sw, ne], {
                bearing: state.orientation === 'upside-down' ? 180 : 0,
                padding: 60, duration: 1800, maxZoom: 14,
              });
            } else {
              state.map.flyTo({
                center: [lon, lat], zoom: 12,
                bearing: state.orientation === 'upside-down' ? 180 : 0,
                duration: 1800,
              });
            }

            titleEl.textContent = name;
            closeGeocoder();
          });

          resultsEl.appendChild(item);
        }
      } catch {
        // Silently fail
      }
    }, 350);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = resultsEl.querySelector('.geocoder-result') as HTMLElement | null;
      if (first) first.click();
    }
  });
}
