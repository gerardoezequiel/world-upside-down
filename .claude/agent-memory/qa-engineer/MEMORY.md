# QA Engineer Memory

## Project State
- **Test coverage**: ZERO tests as of 2026-02-12. No test runner installed.
- **Build**: `npm run build` passes (tsc + vite build). Build time ~1.7s.
- **No test runner in package.json** -- need to add vitest (recommended for Vite projects).

## Module Testability Map
- **A-rated (pure functions)**: recolor-style, ink-palette (lighten/darken/buildDerivedPalette/buildTextPairings/luminance), riso (mulberry32/generateMisregistration), font-system (getFont/getFontsByCategory/createFontState/generateTickerPhrase), shareable-urls (parseShareableHash), graticule (getIntervals/buildGraticuleGeoJSON)
- **B-rated (DOM but mockable)**: map-state (createAppState needs map mock), mode-system, orientation, tools/title (updateScreenprintText), scale-bar, ticker, subtitle, font-system (persistFontState/restoreFontState need sessionStorage mock)
- **C-rated (heavy canvas/DOM)**: dymaxion, riso-effects, projection-cards, landing-init, tools/download, tools/share, tools/locate, geocoding, style-system
- **D-rated (WebGL/Three.js)**: dither-globe, globe-textures

## Files Exceeding 300-Line Limit
- style-system.ts: 554 lines
- font-system.ts: 443 lines
- dither-globe.ts: 425 lines
- projection-cards.ts: 380 lines
- ink-palette.ts: 338 lines

## Code Quality Issues
- `any` casts in recolor-style.ts (every layer cast to `any`)
- `any` casts in dymaxion.ts, riso-effects.ts for MapLibre layer properties
- `declare const THREE: any` in dither-globe.ts (CDN loaded)
- Module-level `document.documentElement` references in font-system.ts and mode-system.ts prevent easy testing
- `_lastPhraseIdx` mutable module state in font-system.ts makes generateTickerPhrase non-deterministic
- Some private helpers (hexToRgb, rgbToHex, luminance) in ink-palette.ts are not exported -- need to export or test indirectly

## Recommended Test Framework
- vitest (native Vite integration, same config, fast)
- jsdom or happy-dom for DOM tests
- No need for Playwright yet (visual QA agent handles that)

## Detailed Test Plan
- See `/Users/gerardoezequiel/Developer/world-upside-down/.claude/agent-memory/qa-engineer/test-plan.md`
