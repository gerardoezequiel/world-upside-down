# Viral Growth Strategy — world-upside-down

## Date: 2026-02-13

## 1. Analytics: Stay with Vercel Analytics + Custom Events
- Already have `@vercel/analytics@^1.6.1`, just using `inject()`
- Add `track()` calls: flip, share, download, search, style_change, title_edit, globe_toggle
- K-factor proxy: add `?ref=shared` to share URLs, track `arrived_from_share` event
- Hobby plan limit: 2 keys per event object (sufficient for current schema)

## 2. Visual Sharing Enhancements
- **QR codes in exports**: qrcode-generator already in deps, add to download canvas composition
- **Dynamic OG images**: Vercel Edge Function at `/api/og`, static tile + title overlay
  - Hash fragment not sent to crawlers — need query params in share URLs
- **Gallery**: Static JSON + pre-rendered thumbnails, `/gallery` page

## 3. Viral Loop Mechanics
- **Challenge mode**: Obfuscated city name in URL, "guess where you are" game
- **Social proof**: Counter via Vercel KV or static weekly update
- **Seasonal hooks**: Date-conditional toast messages and palette overrides
- **Local achievements**: localStorage-based badges (Globe Trotter, Disoriented, etc.)

## Key Insight
The project's viral unit is the *image*, not the *link*. Dynamic OG images transform every shared link into visual content. This is the Wordle emoji grid equivalent — the format IS the message.
