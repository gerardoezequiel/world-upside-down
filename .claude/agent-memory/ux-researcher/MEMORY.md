# UX Researcher Memory

## Project Architecture
- Single-page map app: `map.html` with `src/main.ts` entry point
- Three modes: poster (idle display), explore (map interaction), maker (export/customization)
- State: `src/map-state.ts` (AppState interface)
- Orientation: upside-down (default, bearing 180), normal, mirrored
- Toolbar: 7 buttons (locate, title, style, globe, download, share, story link)
- Mobile: flip FAB replaces desktop touch-controls; bottom sheets replace dropdowns
- Share: Web Share API + copy link + X + LinkedIn (`src/tools/share.ts`)
- URL hash encodes: lat/lon/zoom/bearing + optional title, color, style, palette, font
- Export: canvas-based PNG at 3 sizes (feed 1080x1080, reel 1080x1920, poster 3600x4800)
- OG image: static `/public/og-image.png` (not dynamic per-city)
- Idle timeout: 120s -> poster mode (was 45s per spec, code says 120000ms)
- Deployed on Vercel, no API routes

## Key UX Observations (2026-02-13)
- Toolbar has 7 items + coords; progressive disclosure exists via dropdowns/bottom sheets
- Mobile hides: subtitle, coords (phone), title editor (phone), globe (very small phone)
- Deep linking partially works via hash: style/palette/font/title/color are encoded
- OG image is static - no dynamic per-city/per-orientation preview
- No user-generated content features (pins, annotations, etc.)
- Share text is randomized from templates, includes city name when available
