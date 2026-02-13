# Roadmap — upsidedown.earth

Last updated: 2026-02-13

## Recently Shipped
- Branding, share-as-image, emotion pins, 404 page
- Tissot's indicatrix: geodesic distortion circles
- Custom analytics events across key interactions
- Globe mode with smooth zoom
- Mobile-first UX: native share, flip FAB, pinch-zoom
- Test suite (119 tests)
- Modular codebase: 16 focused modules from monolithic main.ts

## Current Priorities

### NOW — High Impact
1. **Dynamic OG images** — Vercel Edge Function at `/api/og`; static tile + title overlay. Hash fragments aren't sent to crawlers, so share URLs need query params.
2. **QR codes in exports** — `qrcode-generator` already in deps but unused. Add to download canvas composition.
3. **Deep link audit** — Verify style/palette/font/title/color round-trip through URL hash.
4. **Globe mode UX** — Auto-zoom to ~2 on globe enter; animate projection transition; Tissot circles during transition.

### NEXT — Growth Features
5. **Challenge-a-friend** — Obfuscated city name in URL, "guess where you are" game.
6. **Gallery of best flips** — Static JSON + pre-rendered thumbnails at `/gallery`.
7. **Map style fixes** — Tunnel casing filters incorrectly match surface roads (see `docs/STYLE-FIXES.md`).

### LATER — Polish
8. **Social proof counter** — Vercel KV or static weekly update.
9. **Local achievements** — localStorage badges (Globe Trotter, Disoriented, etc.).
10. **Seasonal hooks** — Date-conditional toast messages and palette overrides.

## Key Insight
> The project's viral unit is the *image*, not the *link*. Dynamic OG images transform every shared link into visual content. This is the Wordle emoji grid equivalent.

## Architecture Reference
- Stack: MapLibre GL JS, Vite, TypeScript, D3.js, Three.js, PMTiles
- Entry: `map.html` → `src/main.ts`
- Landing: `index.html` with inline `<script>`
- Deploy: Vercel auto-deploy from `main`
- Domain: `upsidedown.earth`
