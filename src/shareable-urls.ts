import type { AppState } from "./map-state";
import { buildTextPairings } from "./ink-palette";
import { updateScreenprintText } from "./tools/title";

const root = document.documentElement;

const COLOR_NAMES: Record<string, { color: string; shadow: string }> = {
  yellow: { color: '#FFE627', shadow: '#FF48B0' },
  pink:   { color: '#FF48B0', shadow: '#C4305C' },
  teal:   { color: '#00838A', shadow: '#004D52' },
  blue:   { color: '#0078BF', shadow: '#004A75' },
  black:  { color: '#000000', shadow: '#333333' },
};

export function updateShareableHash(state: AppState): void {
  const hash = window.location.hash;
  const parts = hash.replace('#', '').split('/');
  const base = parts.slice(0, 3).join('/');
  const bearing = state.orientation === 'upside-down' ? 180 : 0;
  let newHash = `#${base}/${bearing}`;

  if (state.hasCustomTitle) {
    const l1 = document.getElementById('screenprint-l1')?.textContent || '';
    const l2 = document.getElementById('screenprint-l2')?.textContent || '';
    const title = l2 ? `${l1} ${l2}`.trim() : l1.trim();
    if (title && title !== 'UPSIDE DOWN') {
      newHash += `/t:${encodeURIComponent(title).replace(/%20/g, '+')}`;
    }
  }

  const currentColor = getComputedStyle(root).getPropertyValue('--sp-color').trim();
  const defaultPairings = buildTextPairings(state.currentMapPalette);
  const isDefault = defaultPairings.length > 0 && defaultPairings[0].color.toLowerCase() === currentColor.toLowerCase();
  if (!isDefault && currentColor) {
    const currentShadow = getComputedStyle(root).getPropertyValue('--sp-shadow').trim();
    newHash += `/c:${currentColor.slice(1)}.${currentShadow.slice(1)}`;
  }

  if (state.currentStyleId !== 'custom' && state.currentStyleId !== 'poster') {
    newHash += `/s:${state.currentStyleId}`;
  } else if (state.currentStyleId === 'custom') {
    if (state.currentPaletteId !== 'classic') {
      if (state.currentPaletteId === 'custom') {
        const { base: b, water, built, green, ink } = state.currentMapPalette;
        newHash += `/p:custom:${b}-${water}-${built}-${green}-${ink}`;
      } else {
        newHash += `/p:${state.currentPaletteId}`;
      }
    }
    if (state.fontState.activePairing !== 'poster') {
      if (state.fontState.activePairing === 'custom') {
        newHash += `/f:custom:${state.fontState.activeHero}-${state.fontState.activeTicker}`;
      } else {
        newHash += `/f:${state.fontState.activePairing}`;
      }
    }
  }

  history.replaceState(null, '', newHash);
}

export function parseShareableHash(): { title?: string; colorName?: string } {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  let title: string | undefined;
  let colorName: string | undefined;

  for (const part of parts) {
    if (part.startsWith('t:')) title = decodeURIComponent(part.slice(2).replace(/\+/g, ' '));
    if (part.startsWith('c:')) colorName = part.slice(2);
  }

  return { title, colorName };
}

export function applyShareableParams(state: AppState): void {
  const { title, colorName } = parseShareableHash();

  if (title) {
    updateScreenprintText(title);
    state.hasCustomTitle = true;
  }

  if (colorName) {
    let color: string | undefined;
    let shadow: string | undefined;

    if (colorName.includes('.')) {
      const [c, s] = colorName.split('.');
      color = `#${c}`;
      shadow = `#${s}`;
    } else if (COLOR_NAMES[colorName]) {
      color = COLOR_NAMES[colorName].color;
      shadow = COLOR_NAMES[colorName].shadow;
    }

    if (color && shadow) {
      root.style.setProperty('--sp-color', color);
      root.style.setProperty('--sp-shadow', shadow);

      document.querySelectorAll('#color-strip .color-dot').forEach(dot => {
        const el = dot as HTMLElement;
        dot.classList.toggle('active', el.dataset.color?.toLowerCase() === color!.toLowerCase());
      });
    }
  }

  if (!title) {
    const stored = sessionStorage.getItem('wud-custom-title');
    if (stored) {
      try {
        const { l1, l2 } = JSON.parse(stored);
        const spL1 = document.getElementById('screenprint-l1');
        const spL2 = document.getElementById('screenprint-l2');
        if (spL1 && spL2 && l1) {
          spL1.textContent = l1;
          spL2.textContent = l2;
          state.hasCustomTitle = true;
        }
      } catch {
        // Ignore
      }
    }
  }
}
