# Engineering Team Memory

## Architecture Decisions
- Vite + TypeScript (noEmit: true — tsc for type-checking only)
- Single `AppState` object in `src/map-state.ts` for shared mutable state
- All modules use named exports, async init functions, factory functions
- Files should stay under 300 lines; extract at 3+ use cases
- See `CLAUDE.md` for full module map

## Key Patterns
- **Shared state**: `import { AppState } from './map-state'` — all modules receive state
- **Named exports**: No default exports; every export is named
- **Pure functions**: `recolorStyle(palette, style)` pattern — data in, data out
- **Tool setup**: `setupTool*(state)` pattern for UI tool initialisation

## Tech Stack
- MapLibre GL JS for maps
- Three.js (CDN) for WebGL dither globe
- Vite for dev/build
- Vercel for deployment (auto-deploy from main)
- No testing framework yet (needs setup)

## Build Commands
- `npm run dev` — dev server
- `npm run build` — tsc + vite build
- Deploy: push to main → Vercel auto-deploys

## Module Structure (16 extracted modules)
- See `CLAUDE.md` → Module Map for full list
- `src/main.ts` is thin orchestrator (~142 lines)
- Tools live in `src/tools/*.ts`

## Tech Debt
- No test framework configured yet — assessed 2025-02-12, see testing-strategy.md
- No linting/formatting setup
- Mobile responsiveness incomplete
- Accessibility audit not done
- `graticule.ts`: `getIntervals` and `buildGraticuleGeoJSON` are not exported (needed for testing)
- `scale-bar.ts`: scale calculation embedded in DOM function (should extract pure function)
