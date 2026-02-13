import type { AppState } from "../map-state";
import { setMode } from "../mode-system";
import { buildTextPairings } from "../ink-palette";
import { toggleSidebar, closeSidebar } from "../sidebar";
import { updateShareableHash } from "../shareable-urls";

const root = document.documentElement;

/* ── Phrase bank ─────────────────────────────────────────── */
const HERO_PHRASES: [string, string][] = [
  ['UPSIDE', 'DOWN'],
  ['SOUTH', 'IS UP'],
  ['NO', 'NORTH'],
  ['YOUR ATLAS', 'LIED'],
  ['EVERY MAP', 'IS A LIE'],
  ['THERE IS', 'NO UP'],
  ['DECOLONISE', 'YOUR ATLAS'],
  ['NO BORDERS', 'NO NATIONS'],
  ['TERRA', 'INCOGNITA'],
  ['WILD', 'EARTH'],
  ['THE SOUTH', 'REMEMBERS'],
  ['FLIP THE', 'WORLD'],
  ['LOST IN', '{CITY}'],
  ['{CITY}', 'UPSIDE DOWN'],
  ['{CITY}', 'FROM BELOW'],
];

/* ── Helpers ─────────────────────────────────────────────── */
function resolvePhrase(phrase: [string, string], city: string): [string, string] {
  const c = city.toUpperCase();
  return [
    phrase[0].replace('{CITY}', c),
    phrase[1].replace('{CITY}', c),
  ];
}

function currentScreenprintText(): [string, string] {
  const l1 = document.getElementById('screenprint-l1')?.textContent || '';
  const l2 = document.getElementById('screenprint-l2')?.textContent || '';
  return [l1, l2];
}

function applyText(l1: string, l2: string): void {
  const spL1 = document.getElementById('screenprint-l1');
  const spL2 = document.getElementById('screenprint-l2');
  if (spL1) spL1.textContent = l1;
  if (spL2) spL2.textContent = l2;
}

function applyColor(color: string, shadow: string): void {
  root.style.setProperty('--sp-color', color);
  root.style.setProperty('--sp-shadow', shadow);
}

function getCurrentColor(): string {
  return getComputedStyle(root).getPropertyValue('--sp-color').trim();
}

/* ── Keep public for geocoding ───────────────────────────── */
export function updateScreenprintText(name: string): void {
  const spL1 = document.getElementById('screenprint-l1');
  const spL2 = document.getElementById('screenprint-l2');
  if (!spL1 || !spL2) return;

  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) {
    spL1.textContent = words[0];
    spL2.textContent = '';
  } else if (words.length === 2) {
    spL1.textContent = words[0];
    spL2.textContent = words[1];
  } else {
    spL1.textContent = words[0];
    spL2.textContent = words.slice(1).join(' ');
  }
}

/* ── Title editor state (module-scoped) ──────────────────── */
let editorBuilt = false;
let colorContainer: HTMLElement | null = null;
let phraseCards: HTMLElement[] = [];
let inputL1: HTMLInputElement | null = null;
let inputL2: HTMLInputElement | null = null;
let colorDots: HTMLElement[] = [];

/* ── Build the title editor UI into the sidebar section ──── */
function buildTitleEditor(state: AppState, container: HTMLElement): void {
  if (editorBuilt) return;
  editorBuilt = true;
  container.innerHTML = '';

  const city = state.currentCityName || 'LONDON';

  /* ── Phrase grid ── */
  const phraseLabel = document.createElement('div');
  phraseLabel.className = 'title-section-label';
  phraseLabel.textContent = 'Pick a phrase';
  container.appendChild(phraseLabel);

  const grid = document.createElement('div');
  grid.className = 'phrase-grid';

  const [curL1, curL2] = currentScreenprintText();

  for (const phrase of HERO_PHRASES) {
    const [l1, l2] = resolvePhrase(phrase, city);
    const card = document.createElement('button');
    card.className = 'phrase-card';
    if (l1 === curL1 && l2 === curL2) card.classList.add('active');

    const line1 = document.createElement('span');
    line1.className = 'phrase-l1';
    line1.textContent = l1;
    card.appendChild(line1);

    const line2 = document.createElement('span');
    line2.className = 'phrase-l2';
    line2.textContent = l2;
    card.appendChild(line2);

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      applyText(l1, l2);
      if (inputL1) inputL1.value = l1;
      if (inputL2) inputL2.value = l2;
      highlightActivePhrase(l1, l2);
      state.hasCustomTitle = true;
      persistTitle(l1, l2);
      updateShareableHash(state);
    });

    grid.appendChild(card);
    phraseCards.push(card);
  }
  container.appendChild(grid);

  /* ── Custom input ── */
  const customLabel = document.createElement('div');
  customLabel.className = 'title-section-label';
  customLabel.textContent = 'Or write your own';
  container.appendChild(customLabel);

  const inputsWrap = document.createElement('div');
  inputsWrap.className = 'title-custom-inputs';

  inputL1 = document.createElement('input');
  inputL1.type = 'text';
  inputL1.className = 'title-input';
  inputL1.placeholder = 'Line 1';
  inputL1.value = curL1;
  inputL1.maxLength = 20;

  inputL2 = document.createElement('input');
  inputL2.type = 'text';
  inputL2.className = 'title-input';
  inputL2.placeholder = 'Line 2';
  inputL2.value = curL2;
  inputL2.maxLength = 20;

  function onCustomInput() {
    const v1 = (inputL1!.value || '').toUpperCase();
    const v2 = (inputL2!.value || '').toUpperCase();
    applyText(v1, v2);
    highlightActivePhrase(v1, v2);
    state.hasCustomTitle = true;
    persistTitle(v1, v2);
    updateShareableHash(state);
  }

  inputL1.addEventListener('input', onCustomInput);
  inputL2.addEventListener('input', onCustomInput);

  // Enter on L1 → focus L2
  inputL1.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); inputL2!.focus(); }
  });
  // Enter on L2 → confirm & close
  inputL2.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); closeSidebar(); }
  });

  inputsWrap.appendChild(inputL1);
  inputsWrap.appendChild(inputL2);
  container.appendChild(inputsWrap);

  /* ── Color picker ── */
  const colorLabel = document.createElement('div');
  colorLabel.className = 'title-section-label';
  colorLabel.textContent = 'Text color';
  container.appendChild(colorLabel);

  colorContainer = document.createElement('div');
  colorContainer.className = 'title-colors';
  container.appendChild(colorContainer);

  renderColorDots(state);
}

/* ── Render / refresh color dots ─────────────────────────── */
function renderColorDots(state: AppState): void {
  if (!colorContainer) return;
  colorContainer.innerHTML = '';
  colorDots = [];

  const pairings = buildTextPairings(state.currentMapPalette);
  const currentColor = getCurrentColor();

  for (const p of pairings) {
    const dot = document.createElement('button');
    dot.className = 'title-color-dot';
    if (normalizeHex(p.color) === normalizeHex(currentColor)) dot.classList.add('active');
    dot.setAttribute('aria-label', p.name);

    const fill = document.createElement('span');
    fill.className = 'dot-fill';
    fill.style.background = p.color;
    dot.appendChild(fill);

    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      applyColor(p.color, p.shadow);
      updateShareableHash(state);
    });

    colorContainer!.appendChild(dot);
    colorDots.push(dot);
  }
}

function normalizeHex(hex: string): string {
  return hex.toUpperCase().replace(/\s/g, '');
}

/* ── Highlight the active phrase card ────────────────────── */
function highlightActivePhrase(l1: string, l2: string): void {
  phraseCards.forEach(card => {
    const cardL1 = card.querySelector('.phrase-l1')?.textContent || '';
    const cardL2 = card.querySelector('.phrase-l2')?.textContent || '';
    card.classList.toggle('active', cardL1 === l1 && cardL2 === l2);
  });
}

/* ── Persist title to sessionStorage ─────────────────────── */
function persistTitle(l1: string, l2: string): void {
  sessionStorage.setItem('wud-custom-title', JSON.stringify({ l1, l2 }));
}

/* ── Refresh color picker when palette changes ───────────── */
export function refreshTitleColors(state: AppState): void {
  if (editorBuilt && colorContainer) {
    renderColorDots(state);
  }
}

/* ── Sync inputs/highlights when editor opens ────────────── */
function syncEditorState(state: AppState): void {
  const city = state.currentCityName || 'LONDON';
  const [curL1, curL2] = currentScreenprintText();

  // Update inputs
  if (inputL1) inputL1.value = curL1;
  if (inputL2) inputL2.value = curL2;

  // Re-resolve city-aware phrases and rebuild cards
  phraseCards.forEach((card, i) => {
    const phrase = HERO_PHRASES[i];
    const [l1, l2] = resolvePhrase(phrase, city);
    const line1El = card.querySelector('.phrase-l1');
    const line2El = card.querySelector('.phrase-l2');
    if (line1El) line1El.textContent = l1;
    if (line2El) line2El.textContent = l2;
    card.classList.toggle('active', l1 === curL1 && l2 === curL2);
  });

  // Refresh color dots
  renderColorDots(state);
}

/* ── Main setup — "T" button opens sidebar to title section ── */
export function setupToolTitle(state: AppState): void {
  const btn = document.getElementById('tool-title');
  if (!btn) return;

  const container = document.getElementById('sidebar-title-content');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    // Build editor on first open
    if (container && !editorBuilt) {
      buildTitleEditor(state, container);
    }

    // Sync state every time we open
    syncEditorState(state);

    // Enter maker mode (reduced overlay)
    setMode(state, 'maker');

    toggleSidebar('title');
  });
}
