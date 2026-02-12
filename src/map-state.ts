import maplibregl from "maplibre-gl";
import { DEFAULT_PALETTE_ID, type MapPalette, type DerivedPalette, PALETTES } from "./ink-palette";
import { createFontState, DEFAULT_STYLE_ID, type FontState } from "./font-system";
import { RISO_INKS, PAPER } from "./riso";

/* ── Types ───────────────────────────────────────────────── */
export type Mode = 'poster' | 'explore' | 'maker';
export type Orientation = 'upside-down' | 'normal' | 'mirrored';

/* ── App State ───────────────────────────────────────────── */
export interface AppState {
  map: maplibregl.Map;

  /* Palette */
  PALETTE: Record<string, string>;
  currentPaletteId: string;
  currentMapPalette: MapPalette;

  /* Font */
  fontState: FontState;

  /* Style */
  currentStyleId: string;

  /* Mode */
  currentMode: Mode;
  hasCustomTitle: boolean;
  idleTimer: ReturnType<typeof setTimeout> | null;

  /* Orientation */
  orientation: Orientation;
  bearingLocked: boolean;

  /* Geocoding */
  geocodeTimeout: ReturnType<typeof setTimeout> | null;
  currentCityName: string;

  /* Globe */
  isGlobe: boolean;

  /* Download */
  formatsOpen: boolean;

  /* Toast */
  lastToastTime: number;

  /* Ticker */
  tickerTimeout: ReturnType<typeof setTimeout> | null;
  tickerIdleTimeout: ReturnType<typeof setTimeout> | null;

  /* Geocoder search */
  searchTimeout: ReturnType<typeof setTimeout> | null;
}

export const DEFAULT_PALETTE: Record<string, string> = {
  bg:        PAPER,
  earth:     "#F5F5F5",
  water:     RISO_INKS.teal.hex,
  waterLine: "#006A70",
  buildings: RISO_INKS.blue.hex,
  urban:     "#7BBCE0",
  park:      RISO_INKS.fluorPink.hex,
  parkAlt:   "#FF80C8",
  road:      "#000000",
  roadMajor: "#000000",
  roadMinor: RISO_INKS.lightGray.hex,
  roadCas:   "#D8D4CC",
  rail:      "#000000",
  boundary:  "#000000",
  label:     "#000000",
  labelHalo: PAPER,
  grass:     "#DDD8CC",
  farmland:  "#E0DCC8",
  scrub:     "#D4D0C0",
  barren:    "#E0DAC8",
  glacier:   "#EEEEEE",
  hospital:  "#FFB8D8",
  school:    "#A0D4F0",
  industrial:"#D0D4D8",
  beach:     "#F0E8D0",
  zoo:       "#FFB0D0",
  aerodrome: "#D0D0D0",
  pier:      "#D8D4CC",
  pedestrian:"#E0DCD4",
  runway:    "#B8B4AC",
};

export function createAppState(map: maplibregl.Map): AppState {
  return {
    map,

    PALETTE: { ...DEFAULT_PALETTE },

    currentPaletteId: DEFAULT_PALETTE_ID,
    currentMapPalette: { ...PALETTES[0].palette },

    fontState: createFontState(),

    currentStyleId: DEFAULT_STYLE_ID,

    currentMode: 'poster',
    hasCustomTitle: false,
    idleTimer: null,

    orientation: 'upside-down',
    bearingLocked: true,

    geocodeTimeout: null,
    currentCityName: '',

    isGlobe: false,
    formatsOpen: false,
    lastToastTime: 0,

    tickerTimeout: null,
    tickerIdleTimeout: null,
    searchTimeout: null,
  };
}
