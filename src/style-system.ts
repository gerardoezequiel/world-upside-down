import type { AppState } from "./map-state";
import type { DerivedPalette, MapPalette } from "./ink-palette";
import {
  INK_CATALOG, PALETTES, CATEGORY_INKS,
  buildDerivedPalette, applyMapPalette, buildTextPairings, darken,
} from "./ink-palette";
import {
  FONT_CATEGORIES, FONT_PAIRINGS, DEFAULT_PAIRING_ID,
  STYLE_PRESETS, DEFAULT_STYLE_ID,
  getFont, getFontsByCategory,
  applyPairing, applyHeroFont, applyTickerFont,
  preloadAllFonts, persistFontState,
  type FontCategory, type StylePreset,
} from "./font-system";
import { updateShareableHash } from "./shareable-urls";

const root = document.documentElement;

/* ── Panel helpers ────────────────────────────────────────── */
export function closeAllDropdowns() {
  document.querySelectorAll('.tb-dropdown-menu.open').forEach(el => el.classList.remove('open'));
}

export function closeAllPanels(state: AppState) {
  const colorStrip = document.getElementById('color-strip');
  const exportPreview = document.getElementById('export-preview');
  closeAllDropdowns();
  colorStrip?.classList.remove('visible');
  exportPreview?.classList.remove('visible');
  state.formatsOpen = false;
}

/* ── PALETTE sync helpers ────────────────────────────────── */
function updatePALETTEFromDerived(state: AppState, d: DerivedPalette): void {
  state.PALETTE = { ...d } as unknown as Record<string, string>;
}

function updateLegendColors(d: DerivedPalette): void {
  const rows = document.querySelectorAll('.leg-item');
  const colorMap: Record<string, string> = {
    'Land': d.earth, 'Water': d.water, 'Buildings': d.buildings, 'Parks': d.park,
  };
  rows.forEach(row => {
    const label = row.querySelector('span')?.textContent?.trim();
    if (label && colorMap[label]) {
      const rect = row.querySelector('rect');
      if (rect) {
        rect.setAttribute('fill', colorMap[label]);
        rect.setAttribute('stroke', darken(colorMap[label], 0.15));
      }
    }
  });
}

function updateColorStrip(state: AppState, mp: MapPalette): void {
  const strip = document.getElementById('color-strip');
  if (!strip) return;

  const pairings = buildTextPairings(mp);
  strip.innerHTML = '';

  pairings.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-dot' + (i === 0 ? ' active' : '');
    btn.dataset.color = p.color;
    btn.dataset.shadow = p.shadow;
    btn.setAttribute('aria-label', p.name);

    const span = document.createElement('span');
    span.style.background = p.color;
    btn.appendChild(span);

    if (p.recommended) btn.classList.add('recommended');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      strip.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      root.style.setProperty('--sp-color', p.color);
      root.style.setProperty('--sp-shadow', p.shadow);
      updateShareableHash(state);
    });

    strip.appendChild(btn);
  });

  const first = pairings[0];
  if (first) {
    root.style.setProperty('--sp-color', first.color);
    root.style.setProperty('--sp-shadow', first.shadow);
  }
}

/* ── Style UI update ─────────────────────────────────────── */
function updateStyleUI(state: AppState): void {
  document.querySelectorAll('.style-preset-card').forEach(card => {
    const el = card as HTMLElement;
    card.classList.toggle('active', el.dataset.styleId === state.currentStyleId);
  });

  document.querySelectorAll('.ink-category').forEach(cat => {
    const el = cat as HTMLElement;
    const role = el.dataset.role as keyof MapPalette;
    if (!role) return;
    const inkId = state.currentMapPalette[role];
    const ink = INK_CATALOG[inkId];
    const dot = cat.querySelector('.ink-category-dot') as HTMLElement | null;
    if (dot) dot.style.background = ink.hex;
    const cur = cat.querySelector('.ink-category-current');
    if (cur) cur.textContent = ink.name;
    cat.querySelectorAll('.ink-option').forEach(opt => {
      const optEl = opt as HTMLElement;
      opt.classList.toggle('active', optEl.dataset.inkId === inkId);
    });
  });

  document.querySelectorAll('.font-category').forEach(cat => {
    const el = cat as HTMLElement;
    const catId = el.dataset.category;
    if (!catId) return;
    cat.querySelectorAll('.font-option').forEach(opt => {
      const optEl = opt as HTMLElement;
      opt.classList.toggle('active', optEl.dataset.fontId === state.fontState.activeHero);
    });
    const cur = cat.querySelector('.font-category-current');
    const byCategory = getFontsByCategory();
    const fonts = byCategory[catId as FontCategory] || [];
    const activeFont = fonts.find(f => f.id === state.fontState.activeHero);
    if (cur) cur.textContent = activeFont ? activeFont.name : '';
  });
}

/* ── Persistence ─────────────────────────────────────────── */
function persistStyle(state: AppState): void {
  sessionStorage.setItem('wud-style', JSON.stringify({
    styleId: state.currentStyleId,
    paletteId: state.currentPaletteId,
    palette: state.currentMapPalette,
    fontPairing: state.fontState.activePairing,
    hero: state.fontState.activeHero,
    ticker: state.fontState.activeTicker,
  }));
  persistFontState(state.fontState);
}

/* ── Apply a unified style preset ────────────────────────── */
async function applyStylePreset(state: AppState, style: StylePreset): Promise<void> {
  state.currentStyleId = style.id;

  const inkPreset = PALETTES.find(p => p.id === style.inkPalette);
  if (inkPreset) {
    state.currentPaletteId = inkPreset.id;
    state.currentMapPalette = { ...inkPreset.palette };
    const derived = buildDerivedPalette(state.currentMapPalette);
    applyMapPalette(state.map, derived, state.currentMapPalette);
    updatePALETTEFromDerived(state, derived);
    updateLegendColors(derived);
    updateColorStrip(state, state.currentMapPalette);
  }

  await applyPairing(style.fontPairing, state.fontState);

  const textInk = INK_CATALOG[style.textInk];
  if (textInk) {
    root.style.setProperty('--sp-color', textInk.hex);
    root.style.setProperty('--sp-shadow', darken(textInk.hex, 0.35));
  }

  updateStyleUI(state);
  persistStyle(state);
  updateShareableHash(state);
}

/* ── Select a single category ink ────────────────────────── */
function selectCategoryInk(state: AppState, role: keyof MapPalette, inkId: string): void {
  state.currentMapPalette[role] = inkId;
  state.currentPaletteId = 'custom';
  state.currentStyleId = 'custom';

  const derived = buildDerivedPalette(state.currentMapPalette);
  applyMapPalette(state.map, derived, state.currentMapPalette);
  updatePALETTEFromDerived(state, derived);
  updateLegendColors(derived);
  updateColorStrip(state, state.currentMapPalette);
  updateStyleUI(state);
  persistStyle(state);
  updateShareableHash(state);
}

/* ── Build ink customizer ────────────────────────────────── */
function buildInkCustomizer(state: AppState, container: HTMLElement): void {
  const section = document.createElement('div');
  section.className = 'style-custom-section';

  const title = document.createElement('div');
  title.className = 'ink-section-title';
  title.textContent = 'Ink drums';
  section.appendChild(title);

  const roles: { key: keyof MapPalette; label: string }[] = [
    { key: 'base', label: 'Base' }, { key: 'water', label: 'Water' },
    { key: 'built', label: 'Built' }, { key: 'green', label: 'Green' },
    { key: 'ink', label: 'Ink' },
  ];

  for (const { key, label } of roles) {
    const cat = document.createElement('div');
    cat.className = 'ink-category';
    cat.dataset.role = key;

    const header = document.createElement('div');
    header.className = 'ink-category-header';

    const dot = document.createElement('span');
    dot.className = 'ink-dot ink-category-dot';
    dot.style.background = INK_CATALOG[state.currentMapPalette[key]].hex;
    header.appendChild(dot);

    const labelEl = document.createElement('span');
    labelEl.className = 'ink-category-label';
    labelEl.textContent = label;
    header.appendChild(labelEl);

    const current = document.createElement('span');
    current.className = 'ink-category-current';
    current.textContent = INK_CATALOG[state.currentMapPalette[key]].name;
    header.appendChild(current);

    header.addEventListener('click', (e) => { e.stopPropagation(); cat.classList.toggle('open'); });
    cat.appendChild(header);

    const body = document.createElement('div');
    body.className = 'ink-category-body';

    for (const inkId of CATEGORY_INKS[key]) {
      const ink = INK_CATALOG[inkId];
      const opt = document.createElement('button');
      opt.className = 'ink-option' + (state.currentMapPalette[key] === inkId ? ' active' : '');
      opt.dataset.inkId = inkId;

      const optDot = document.createElement('span');
      optDot.className = 'ink-dot';
      optDot.style.background = ink.hex;
      opt.appendChild(optDot);

      const optName = document.createElement('span');
      optName.textContent = ink.name;
      opt.appendChild(optName);

      opt.addEventListener('click', (e) => { e.stopPropagation(); selectCategoryInk(state, key, inkId); });
      body.appendChild(opt);
    }

    cat.appendChild(body);
    section.appendChild(cat);
  }

  container.appendChild(section);
}

/* ── Build font customizer ───────────────────────────────── */
function buildFontCustomizer(state: AppState, container: HTMLElement): void {
  const section = document.createElement('div');
  section.className = 'style-custom-section';

  const title = document.createElement('div');
  title.className = 'ink-section-title';
  title.textContent = 'Hero font';
  section.appendChild(title);

  const byCategory = getFontsByCategory();
  const categories: FontCategory[] = ['slab', 'fatface', 'blade', 'hand', 'wire', 'scrawl'];

  for (const catId of categories) {
    const catMeta = FONT_CATEGORIES[catId];
    const fonts = byCategory[catId];
    if (!fonts.length) continue;

    const cat = document.createElement('div');
    cat.className = 'font-category';
    cat.dataset.category = catId;

    const header = document.createElement('div');
    header.className = 'font-category-header';
    header.textContent = catMeta.label;

    const current = document.createElement('span');
    current.className = 'font-category-current';
    const activeFont = fonts.find(f => f.id === state.fontState.activeHero);
    current.textContent = activeFont ? activeFont.name : '';
    header.appendChild(current);

    header.addEventListener('click', (e) => { e.stopPropagation(); cat.classList.toggle('open'); });
    cat.appendChild(header);

    const body = document.createElement('div');
    body.className = 'font-category-body';

    for (const font of fonts) {
      const opt = document.createElement('button');
      opt.className = 'font-option' + (state.fontState.activeHero === font.id ? ' active' : '');
      opt.dataset.fontId = font.id;

      const sample = document.createElement('span');
      sample.className = 'font-option-sample';
      sample.style.fontFamily = font.family;
      if (font.isVariable && font.variableAxes?.WONK) {
        sample.style.fontVariationSettings = "'WONK' 1, 'opsz' 144";
      }
      sample.textContent = font.sampleText;
      opt.appendChild(sample);

      const name = document.createElement('span');
      name.className = 'font-option-name';
      name.textContent = font.name;
      opt.appendChild(name);

      opt.addEventListener('click', async (e) => {
        e.stopPropagation();
        await applyHeroFont(font.id, state.fontState);
        state.fontState.activePairing = 'custom';
        state.currentStyleId = 'custom';
        updateStyleUI(state);
        persistStyle(state);
        updateShareableHash(state);
      });

      body.appendChild(opt);
    }

    cat.appendChild(body);
    section.appendChild(cat);
  }

  container.appendChild(section);
}

/* ── Restore style from URL hash or sessionStorage ───────── */
async function restoreStyle(state: AppState): Promise<void> {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');

  let restoredInk = false;
  let restoredFont = false;

  for (const part of parts) {
    if (part.startsWith('s:')) {
      const sVal = part.slice(2);
      const style = STYLE_PRESETS.find(s => s.id === sVal);
      if (style) { await applyStylePreset(state, style); return; }
    }

    if (part.startsWith('p:')) {
      const pVal = part.slice(2);
      if (pVal.startsWith('custom:')) {
        const inks = pVal.slice(7).split('-');
        if (inks.length === 5) {
          const [base, water, built, green, ink] = inks;
          if (INK_CATALOG[base] && INK_CATALOG[water] && INK_CATALOG[built] && INK_CATALOG[green] && INK_CATALOG[ink]) {
            state.currentMapPalette = { base, water, built, green, ink };
            state.currentPaletteId = 'custom';
            state.currentStyleId = 'custom';
            const derived = buildDerivedPalette(state.currentMapPalette);
            applyMapPalette(state.map, derived, state.currentMapPalette);
            updatePALETTEFromDerived(state, derived);
            updateLegendColors(derived);
            updateColorStrip(state, state.currentMapPalette);
            restoredInk = true;
          }
        }
      } else {
        const preset = PALETTES.find(p => p.id === pVal);
        if (preset) {
          state.currentPaletteId = preset.id;
          state.currentMapPalette = { ...preset.palette };
          const derived = buildDerivedPalette(state.currentMapPalette);
          applyMapPalette(state.map, derived, state.currentMapPalette);
          updatePALETTEFromDerived(state, derived);
          updateLegendColors(derived);
          updateColorStrip(state, state.currentMapPalette);
          restoredInk = true;
        }
      }
    }

    if (part.startsWith('f:')) {
      const fVal = part.slice(2);
      if (fVal.startsWith('custom:')) {
        const [heroId, tickerId] = fVal.slice(7).split('-');
        if (getFont(heroId) && getFont(tickerId)) {
          await applyHeroFont(heroId, state.fontState);
          await applyTickerFont(tickerId, state.fontState);
          state.fontState.activePairing = 'custom';
          restoredFont = true;
        }
      } else {
        const pairing = FONT_PAIRINGS.find(p => p.id === fVal);
        if (pairing) { await applyPairing(pairing.id, state.fontState); restoredFont = true; }
      }
    }
  }

  if (restoredInk || restoredFont) {
    if (restoredInk && !restoredFont) {
      const matchingStyle = STYLE_PRESETS.find(s => s.inkPalette === state.currentPaletteId);
      if (matchingStyle) {
        await applyPairing(matchingStyle.fontPairing, state.fontState);
        state.currentStyleId = matchingStyle.id;
      } else {
        state.currentStyleId = 'custom';
        await applyPairing(DEFAULT_PAIRING_ID, state.fontState);
      }
    } else {
      state.currentStyleId = 'custom';
    }
    updateStyleUI(state);
    return;
  }

  const stored = sessionStorage.getItem('wud-style');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.styleId && data.styleId !== 'custom') {
        const style = STYLE_PRESETS.find(s => s.id === data.styleId);
        if (style) { await applyStylePreset(state, style); return; }
      }
      if (data.palette && data.palette.base) {
        const allValid = [data.palette.base, data.palette.water, data.palette.built, data.palette.green, data.palette.ink]
          .every((inkId: string) => INK_CATALOG[inkId]);
        if (allValid) {
          state.currentMapPalette = data.palette;
          state.currentPaletteId = data.paletteId || 'custom';
          state.currentStyleId = 'custom';
          const derived = buildDerivedPalette(state.currentMapPalette);
          applyMapPalette(state.map, derived, state.currentMapPalette);
          updatePALETTEFromDerived(state, derived);
          updateLegendColors(derived);
          updateColorStrip(state, state.currentMapPalette);
        }
      }
      if (data.hero && getFont(data.hero)) {
        await applyHeroFont(data.hero, state.fontState);
        if (data.ticker && getFont(data.ticker)) {
          await applyTickerFont(data.ticker, state.fontState);
        }
        state.fontState.activePairing = data.fontPairing || 'custom';
      }
      updateStyleUI(state);
      return;
    } catch { /* Ignore */ }
  }

  const defaultStyle = STYLE_PRESETS.find(s => s.id === DEFAULT_STYLE_ID);
  if (defaultStyle) await applyStylePreset(state, defaultStyle);
}

/* ── Main setup ──────────────────────────────────────────── */
export function setupToolStyle(state: AppState): void {
  const btn = document.getElementById('tool-style');
  const panel = document.getElementById('style-panel');
  const presetsContainer = document.getElementById('style-presets');
  const customContainer = document.getElementById('style-customize');
  if (!btn || !panel || !presetsContainer || !customContainer) return;

  let fontsPreloading = false;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      panel.classList.add('open');
      if (!fontsPreloading) { fontsPreloading = true; preloadAllFonts(state.fontState); }
    }
  });

  const placeName = state.currentCityName || 'London';

  for (const style of STYLE_PRESETS) {
    const inkPreset = PALETTES.find(p => p.id === style.inkPalette);
    const fontPairing = FONT_PAIRINGS.find(p => p.id === style.fontPairing);
    if (!inkPreset || !fontPairing) continue;

    const heroFont = getFont(fontPairing.hero);
    const tickerFont = getFont(fontPairing.ticker);
    if (!heroFont || !tickerFont) continue;

    const card = document.createElement('div');
    card.className = 'style-preset-card' + (style.id === state.currentStyleId ? ' active' : '');
    card.dataset.styleId = style.id;

    const dotsRow = document.createElement('div');
    dotsRow.className = 'style-preset-dots';
    for (const role of ['base', 'water', 'built', 'green', 'ink'] as (keyof MapPalette)[]) {
      const dot = document.createElement('span');
      dot.className = 'ink-dot';
      dot.style.background = INK_CATALOG[inkPreset.palette[role]].hex;
      dotsRow.appendChild(dot);
    }
    const textDot = document.createElement('span');
    textDot.className = 'ink-dot style-text-dot';
    const textInk = INK_CATALOG[style.textInk];
    if (textInk) textDot.style.background = textInk.hex;
    dotsRow.appendChild(textDot);
    card.appendChild(dotsRow);

    const heroSample = document.createElement('div');
    heroSample.className = 'style-preset-hero';
    heroSample.style.fontFamily = heroFont.family;
    if (heroFont.isVariable && heroFont.variableAxes?.WONK) {
      heroSample.style.fontVariationSettings = "'WONK' 1, 'opsz' 144";
    }
    if (textInk) heroSample.style.color = textInk.hex;
    heroSample.textContent = heroFont.sampleText;
    card.appendChild(heroSample);

    const tickerSample = document.createElement('div');
    tickerSample.className = 'style-preset-ticker';
    tickerSample.style.fontFamily = tickerFont.family;
    tickerSample.innerHTML = `lost in <span style="font-family:${heroFont.family};text-transform:uppercase;font-weight:700">${placeName}</span>`;
    card.appendChild(tickerSample);

    const meta = document.createElement('div');
    meta.className = 'style-preset-meta';
    const nameEl = document.createElement('span');
    nameEl.className = 'style-preset-name';
    nameEl.textContent = style.name;
    meta.appendChild(nameEl);
    const charEl = document.createElement('span');
    charEl.className = 'style-preset-char';
    charEl.textContent = style.character;
    meta.appendChild(charEl);
    card.appendChild(meta);

    card.addEventListener('click', (e) => { e.stopPropagation(); applyStylePreset(state, style); });
    presetsContainer.appendChild(card);
  }

  const customToggle = document.createElement('button');
  customToggle.className = 'style-customize-toggle';
  customToggle.textContent = 'customize...';
  customToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    customContainer.classList.toggle('open');
    customToggle.textContent = customContainer.classList.contains('open') ? 'back to presets' : 'customize...';
  });
  presetsContainer.appendChild(customToggle);

  buildInkCustomizer(state, customContainer);
  buildFontCustomizer(state, customContainer);
  updateColorStrip(state, state.currentMapPalette);
  restoreStyle(state);
}
