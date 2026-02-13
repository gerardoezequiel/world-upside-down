# Geo Frontend Dev Agent Memory

## Stack
- MapLibre GL JS `^5.18.0`
- PMTiles `^4.4.0` (Protomaps v4 basemap)
- D3-geo `^3.1.1` + d3-geo-polygon `^2.0.1` (Dymaxion projection)
- Vite `^6.1.0` dev server and build

## Map Configuration
- Container: `#map` in `map.html`
- Default center: London (-0.128, 51.507), zoom 11
- Bearing: 180 (south-up), pitch: 0
- Min zoom: 1, max zoom: 18
- `preserveDrawingBuffer: true` (for canvas capture/export)
- `hash: true` (URL encodes lat/lon/zoom/bearing)
- Drag rotate and touch rotation disabled (bearing is locked)

## Key Patterns
- Style is loaded from `/style.json`, then recolored via `recolorStyle()` before passing to Map constructor
- Graticule added as GeoJSON source with 3 layers (sub lines, major lines, labels)
- Riso misregistration effect applied post-load via `applyRisoMisregistration()`
- Dymaxion crossfade: opacity transition at zoom < 3, map element fades out as Dymaxion canvas fades in
- Globe mode: simple `setProjection({ type: 'globe' })` toggle

## Key Files
- `src/main.ts` — App entry, map init, event wiring
- `src/graticule.ts` — Adaptive GeoJSON graticule
- `src/recolor-style.ts` — Runtime style recoloring from ink palette
- `src/riso-effects.ts` — Halftone/misregistration post-processing
- `src/scale-bar.ts` — Custom SVG scale bar with ratio display
- `src/tools/globe.ts` — Globe projection toggle
- `style.json` — 71-layer Protomaps basemap (4840 lines)
