# Cartographer Agent Memory

## Project Context
- South-up Mercator map at bearing 180 (default orientation)
- Three orientations: upside-down (default), normal, mirrored
- Globe mode toggles MapLibre projection between mercator and globe
- Dymaxion (Airocean/Fuller) projection appears at zoom < 3 as easter egg
- Graticule: adaptive intervals based on zoom level, gold (#D4A017) lines with labels

## Key Files
- `src/graticule.ts` — GeoJSON graticule with major/sub lines and lat/lon labels
- `src/dymaxion.ts` — D3 Airocean projection with riso compositor, lazy TopoJSON loading
- `src/tools/globe.ts` — Simple toggle: mercator ↔ globe projection
- `src/orientation.ts` — Bearing control (180 for south-up, 0 for normal)
- `style.json` — 71-layer Protomaps v4 PMTiles basemap style

## Known Issues
- Globe mode at zoom 11 shows no visible difference (need auto-zoom to ~2)
- Dymaxion doesn't work in globe mode (zoom-level trigger doesn't apply)
- Tunnel casing filters in style.json incorrectly match surface roads

## Tissot's Indicatrix
- Mercator is conformal: h = k = sec(latitude), so Tissot circles stay circular but grow toward poles
- Area scale factor: sec^2(latitude) — grows dramatically near poles
- Implementation approach: GeoJSON circle features at 15-30 degree grid spacing
- Aesthetic fit: circles look like risograph registration dots
