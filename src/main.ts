import maplibregl from "maplibre-gl";
import { trackVisitType, trackSessionSummary } from "./analytics";
import { initDymaxion } from "./dymaxion";
import { createAppState, DEFAULT_PALETTE } from "./map-state";
import { recolorStyle } from "./recolor-style";
import { updateScaleBar, updateCoords } from "./scale-bar";
import { addGraticule } from "./graticule";
import { applyRisoMisregistration } from "./riso-effects";
import { setMode, resetIdleTimer } from "./mode-system";
import { setupFlip } from "./orientation";
import { updateCityTitle, setupGeocoder } from "./geocoding";
import { setupTicker } from "./ticker";
import { setupToolStyle } from "./style-system";
import { setupToolLocate } from "./tools/locate";
import { setupToolTitle } from "./tools/title";
import { setupToolGlobe } from "./tools/globe";
import { setupToolDownload } from "./tools/download";
import { setupToolShare } from "./tools/share";
import { setupTissot } from "./tissot";
import { setupPins } from "./pins";
import { applyShareableParams } from "./shareable-urls";
import { startSubtitleAnimation } from "./subtitle";
import { setupOnboarding } from "./onboarding";
import { setupSplash } from "./splash";
import { setupSidebar } from "./sidebar";
import { setupLayers } from "./layers";

const root = document.documentElement;

async function init() {
  // Show splash for first-time visitors before anything else
  setupSplash();
  const res = await fetch("/style.json");
  const baseStyle = (await res.json()) as maplibregl.StyleSpecification;

  const style = recolorStyle(DEFAULT_PALETTE, baseStyle);

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [-0.128, 51.507],
    zoom: 11,
    bearing: 180,
    pitch: 0,
    minZoom: 1,
    maxZoom: 18,
    maxTileCacheSize: 200,
    attributionControl: {},
    hash: true,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });

  /* Real state with map reference */
  const state = createAppState(map);

  trackVisitType();
  trackSessionSummary(() => state);

  map.dragRotate.disable();
  // Note: we do NOT call touchZoomRotate.disableRotation() because in
  // MapLibre 5.x it appears to also break pinch-to-zoom on some devices.
  // Instead, we let the bearing lock below correct any accidental rotation.

  map.on('moveend', () => {
    if (!state.bearingLocked) return;
    const expected = state.orientation === 'upside-down' ? 180 : 0;
    if (state.orientation !== 'mirrored' && Math.abs(map.getBearing() - expected) > 0.1) {
      map.easeTo({ bearing: expected, duration: 200 });
    }
  });

  // Continuously correct bearing during touch gestures so rotation
  // from pinch doesn't visually drift far before moveend snaps it back.
  map.on('rotate', () => {
    if (!state.bearingLocked) return;
    const expected = state.orientation === 'upside-down' ? 180 : 0;
    if (state.orientation !== 'mirrored' && Math.abs(map.getBearing() - expected) > 1) {
      map.setBearing(expected);
    }
  });

  map.on('movestart', () => {
    if (state.currentMode === 'poster') setMode(state, 'explore');
    resetIdleTimer(state);
  });

  map.on('zoomstart', () => {
    if (state.currentMode === 'poster') setMode(state, 'explore');
    resetIdleTimer(state);
  });

  ['mousemove', 'touchstart', 'wheel', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => resetIdleTimer(state), { passive: true });
  });

  /* Landscape: auto-hide bot-band after 3s, show on tap */
  const botBand = document.getElementById('bot-band');
  let landscapeTimer: ReturnType<typeof setTimeout> | null = null;
  const landscapeMQ = window.matchMedia('(max-height: 500px) and (orientation: landscape)');

  function startLandscapeHide() {
    if (!landscapeMQ.matches || !botBand) return;
    if (landscapeTimer) clearTimeout(landscapeTimer);
    botBand.classList.remove('landscape-hidden');
    landscapeTimer = setTimeout(() => botBand.classList.add('landscape-hidden'), 3000);
  }

  function showBotBand() {
    if (!botBand) return;
    botBand.classList.remove('landscape-hidden');
    startLandscapeHide();
  }

  landscapeMQ.addEventListener('change', () => {
    if (landscapeMQ.matches) startLandscapeHide();
    else { botBand?.classList.remove('landscape-hidden'); if (landscapeTimer) clearTimeout(landscapeTimer); }
  });

  if (landscapeMQ.matches) startLandscapeHide();
  document.getElementById('map-frame')?.addEventListener('click', showBotBand, { passive: true });

  const spOverlay = document.getElementById('screenprint-overlay');

  // Tap anywhere on map → enter explore mode (overlay is pointer-events:none
  // so all touch/click events reach the map canvas directly, enabling pinch-zoom)
  map.on('click', () => {
    if (state.currentMode === 'poster') setMode(state, 'explore');
  });

  /* Loading state with rotating copy */
  const loadingEl = document.getElementById('map-loading');
  const loadingTexts = [
    'Warming up the riso drums...',
    'Rotating 180 degrees...',
    'Unlearning north...',
    'Inverting 500 years of habit...',
    'Flipping the world...',
    'Decolonising your atlas...',
    'Consulting Al-Idrisi...',
    'Recalibrating south...',
    'Questioning Mercator...',
    'Spinning the blue marble...',
    'Asking Antarctica for directions...',
    'Loading the honest projection...',
    'Reversing 500 years of propaganda...',
    'Calibrating riso ink levels...',
    'Preparing your disorientation...',
  ];
  const loadingText = loadingEl?.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
  }

  map.on('load', () => {
    /* Dismiss loading state */
    loadingEl?.classList.add('hidden');
    setTimeout(() => loadingEl?.remove(), 1000);

    updateScaleBar(state);
    updateCoords(state);
    updateCityTitle(state);
    setupGeocoder(state);
    setupFlip(state);
    addGraticule(state);
    applyRisoMisregistration(state);

    /* Tools */
    setupSidebar(state);
    setupToolLocate(state);
    setupToolTitle(state);
    setupToolStyle(state);
    setupToolGlobe(state);
    setupToolDownload(state);
    setupToolShare(state);
    setupTissot(state);
    setupPins(state);
    setupLayers(state);
    setupTicker(state);
    setupOnboarding(state);
    applyShareableParams(state);

    /* Start in poster mode */
    setMode(state, 'explore'); // trick: set to explore first so setMode('poster') actually fires
    setMode(state, 'poster');
    state.currentMode = 'poster';
    root.style.setProperty('--overlay-opacity', '0.75');
    spOverlay?.classList.add('poster-mode');

    startSubtitleAnimation();
  });

  /* Dymaxion crossfade */
  const mapFrame = document.getElementById('map-frame')!;
  const mapEl = document.getElementById('map')!;
  const dymaxionLabel = document.getElementById('dymaxion-label');
  const gratLabels = document.getElementById('grat-edge-labels');

  initDymaxion(mapFrame).then(dymaxion => {
    function updateDymaxionTransition() {
      // Suppress Dymaxion when globe projection is active
      if (state.isGlobe) {
        dymaxion.show(0);
        mapEl.style.opacity = '1';
        if (gratLabels) gratLabels.style.opacity = '1';
        if (dymaxionLabel) dymaxionLabel.classList.remove('visible');
        return;
      }
      const zoom = map.getZoom();
      const t = Math.max(0, Math.min(1, 3 - zoom));
      dymaxion.show(t);
      mapEl.style.opacity = String(1 - t);
      if (gratLabels) gratLabels.style.opacity = String(1 - t);
      if (dymaxionLabel) dymaxionLabel.classList.toggle('visible', t > 0.9);
    }
    state.onGlobeChange = updateDymaxionTransition;
    map.on('zoom', updateDymaxionTransition);
    window.addEventListener('resize', () => dymaxion.resize());
  });

  map.on('zoom', () => {
    updateScaleBar(state);
    updateCoords(state);
  });

  map.on('moveend', () => {
    updateScaleBar(state);
    updateCoords(state);
    updateCityTitle(state);
  });

  map.on('move', () => {
    updateCoords(state);
  });
}

init();
