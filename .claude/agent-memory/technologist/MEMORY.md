# Technologist Agent Memory

## Stack
- **Runtime**: Vite ^6.1.0 (dev + build), TypeScript ^5.7.0
- **Map**: MapLibre GL JS ^5.18.0, PMTiles ^4.4.0, Protomaps v4
- **Rendering**: D3-geo ^3.1.1, d3-geo-polygon ^2.0.1, Three.js (CDN, landing only)
- **Testing**: Vitest ^4.0.18, happy-dom ^20.6.1 (119 tests)
- **Analytics**: @vercel/analytics ^1.6.1
- **Unused deps**: qrcode-generator ^2.0.4 (in package.json, not imported)
- **Deploy**: Vercel auto-deploy from `main`

## Build
- `npm run build` = `tsc && vite build`
- PostToolUse hook runs `npx tsc --noEmit` on every .ts edit
- Stop hook runs `npm run build` to verify before session ends

## Architecture
- Landing: `index.html` with inline `<script>`, CSS at `src/landing.css`
- Map app: `map.html` → `src/main.ts` (16 focused modules)
- Style: `/style.json` (71 Protomaps layers, 4840 lines)
- No API routes; static site only
- `preserveDrawingBuffer: true` on map canvas for export

## Module Map
- `src/main.ts` — entry, map init, event wiring
- `src/map-state.ts` — AppState interface, defaults
- `src/orientation.ts` — flip mechanics + toast messages
- `src/graticule.ts` — adaptive GeoJSON graticule
- `src/dymaxion.ts` — Fuller/Airocean projection overlay
- `src/riso.ts` / `src/riso-effects.ts` — risograph compositor + halftone
- `src/ink-palette.ts` — 6 palette presets, per-category customizer
- `src/font-system.ts` — 19 fonts, 6 pairings
- `src/recolor-style.ts` — runtime basemap recoloring
- `src/style-system.ts` — style panel, dropdown management
- `src/mode-system.ts` — poster/explore/maker mode transitions
- `src/geocoding.ts` — reverse geocoding, search
- `src/shareable-urls.ts` — URL hash state encoding
- `src/tools/` — locate, title, globe, download, share
- `src/scale-bar.ts` — custom SVG scale bar
- `src/ticker.ts` — scrolling ticker
- `src/subtitle.ts` — animated subtitle
