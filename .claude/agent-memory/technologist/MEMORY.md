# Technologist Agent Memory

## Project: World Upside Down
- Vite + TypeScript (noEmit), MapLibre GL, Three.js (CDN)
- 16 modules, single AppState, named exports only
- No tests yet (strategy assessed 2025-02-12)

## Testing Strategy (assessed 2025-02-12)
- **Stack**: Vitest + happy-dom (merge config into vite.config.ts)
- **Highest-value targets**: ink-palette colour math, recolorStyle, shareable-urls parsing, riso PRNG
- **Refactoring needed before tests**: export getIntervals/buildGraticuleGeoJSON from graticule.ts, extract pure scale calc from scale-bar.ts
- **Do not test**: main.ts orchestrator, dymaxion canvas render, Three.js globe, download canvas compositing
- **MapLibre mock**: factory returning vi.fn() stubs for getCenter, getZoom, getStyle, setPaintProperty, etc.
- Full assessment in `.claude/memory/engineering-team/testing-strategy.md`

## Conventions
- Never add Co-Authored-By to commits
- Files under 300 lines, extract at 3+ use cases
- Pure functions where possible, DOM in setup* functions
