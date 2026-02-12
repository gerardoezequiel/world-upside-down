# Testing Strategy Assessment (2025-02-12)

## Decision: Vitest + happy-dom
- Vitest shares Vite transform pipeline, zero extra config
- happy-dom over jsdom for speed; fallback to jsdom per-file if needed
- No Three.js mocking; WebGL tested only via Playwright if ever

## Testability Classification
- **Pure (Tier A)**: ink-palette (colour math, palette derivation), recolor-style, riso (PRNG, misregistration), font-system (lookups, state factory, phrase gen), shareable-urls (parseShareableHash), graticule (GeoJSON gen -- needs export)
- **DOM-coupled (Tier B)**: mode-system, orientation, scale-bar, subtitle, ticker, geocoding
- **MapLibre-coupled (Tier C)**: ink-palette (applyMapPalette), graticule (addGraticule), riso-effects, main.ts
- **Canvas/WebGL (Tier D)**: RisoCompositor, dymaxion, dither-globe, tools/download

## Risk Ranking (by user-visible impact)
1. recolor-style + buildDerivedPalette (broken = whole map wrong)
2. shareable-urls (broken = shared links fail silently)
3. orientation/applyOrientation (broken = core feature fails)
4. mode-system/setMode (broken = UI stuck)
5. scale-bar calculation (broken = misleading distances)

## Refactoring Prerequisites
- Export `getIntervals` and `buildGraticuleGeoJSON` from graticule.ts
- Extract scale calculation from `updateScaleBar` into pure function

## What NOT to test
- main.ts (orchestration glue), dymaxion.ts (canvas render), dither-globe.ts (WebGL), download.ts (browser-only APIs), subtitle.ts (timer animation), analytics.ts (SDK wrapper), static data arrays
