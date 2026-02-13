# Innovator Agent Memory

## Project Overview
- **world-upside-down**: Web app flipping maps upside-down to challenge cartographic assumptions
- Deployed on Vercel, auto-deploy from `main`
- Stack: MapLibre GL JS, Vite, TypeScript, D3.js, Three.js, PMTiles
- Landing page: `index.html` (editorial design, rich content ~1240 lines)
- Map app: `map.html` (interactive south-up map)

## Key Architecture Files
- `src/analytics.ts` — currently just `inject()` from `@vercel/analytics`
- `src/tools/share.ts` — sharing (native, LinkedIn, X, clipboard)
- `src/tools/download.ts` — export (feed 1080x1080, reel 1080x1920, poster 3600x4800)
- `src/shareable-urls.ts` — URL state encoding (title, color, style, palette, font)
- `src/orientation.ts` — flip mechanics (upside-down, normal, mirrored)
- `src/map-state.ts` — AppState interface, modes (poster/explore/maker)

## Strategic Priorities (Feb 2026)
1. Analytics custom events with `track()` from `@vercel/analytics` — NOW
2. Dynamic OG images via Vercel Edge Function — NOW (highest viral impact)
3. Enhanced shareable images with QR code — NOW (qrcode-generator already in deps)
4. Deep link audit — NOW (quick fix)
5. Challenge-a-friend mechanic — NEXT
6. Gallery of best flips — NEXT
7. Social proof counter — LATER
8. Local achievements — LATER

## Technical Notes
- `preserveDrawingBuffer: true` is set in map init (line 42, main.ts) — canvas capture works
- URL hash not sent to social crawlers — share URLs need query params for OG
- Vercel Hobby plan: 2 keys max per custom event object
- `qrcode-generator@^2.0.4` already in package.json but unused in exports

## Detailed Strategy
See `viral-growth-strategy.md` for full analysis.
