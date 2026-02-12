# UX Redesign: World Upside Down — Interactive Screenprint Map

## Project Philosophy

This is an interactive south-up world map with a 5-colour risograph screenprint aesthetic. The core thesis: **north is up because convention, not truth.** The UX should mirror this — the user arrives as a passive viewer of someone else's poster, then gradually becomes the maker.

The arc: **Receive → Question → Discover → Locate → Claim → Take.**

---

## What Exists Now (don't break these)

- **MapLibre GL JS** map with `bearing: 180` (south-up), hash routing, Protomaps tiles
- **5-colour riso palette**: Light Gray `#88898A`, Teal `#00838A`, Blue `#0078BF`, Fluorescent Pink `#FF48B0`, Black `#000000` on white paper `#FFFFFF`
- **Misregistration engine** in `riso.ts` — session-seeded sub-pixel offsets per ink drum
- **Screenprint overlay**: two `<span>` lines ("UPSIDE" / "DOWN") in Anton font, yellow `#F7FF00` with pink `#FF48B0` text-shadow, `mix-blend-mode: multiply`
- **Three orientations**: upside-down (bearing 180), normal (bearing 0), mirrored (CSS scaleX -1). Toggled via arrow keys (desktop) and `.flip-btn` buttons (mobile)
- **Geocoder**: click `#city-title` → search input opens → Nominatim lookup → fly to result
- **Animated subtitle**: cycling phrases typed/deleted in `#subtitle-text`
- **Graticule**: dynamic major/sub grid lines with gold `#D4A017` edge labels
- **Dymaxion crossfade**: at zoom < 3, D3 Dymaxion projection fades in over the map
- **Ambient toasts**: periodic witty messages in `#flip-toast`, some location-aware
- **Scale bar**: custom SVG with alternating ticks, ratio display
- **North arrow**: SVG compass rose in bottom band, rotates with orientation
- **Bottom band**: compass, scale bar, 5-colour legend, flip hint (desktop), nav links, author credit

Key files:
- `map.html` — all markup
- `src/main.ts` — all logic (~1312 lines)
- `src/style.css` — all styles
- `src/riso.ts` — ink palette, misregistration math
- `src/dymaxion.ts` — D3 Dymaxion projection

---

## The Three-Mode System

Replace the current passive dimming (`dimmed` → `faded` → `hidden` classes applied by side-effect) with an intentional three-mode system. This is the backbone of all other changes.

### MODE 1: POSTER (default on load)

The map is a finished screenprint. The user is the viewer.

**Screenprint overlay:**
- Opacity 0.90, `mix-blend-mode: multiply`
- Text has subtle ink texture via SVG `feTurbulence` filter (see Design System below)
- `pointer-events: auto` — the text itself is clickable (this is the exit to Explore mode)
- Cursor on hover: `cursor: pointer` with a subtle scale hint (`transform: scale(1.005)` on hover, 0.3s ease)

**What's visible:** screenprint text, map underneath (visible but secondary), top band, bottom band (compass, scale, legend, author credit). Everything a real printed map poster would have.

**What's hidden:** ⊕ registration mark, tools row, touch flip buttons, flip hint.

**Transitions IN (from Explore):**
- Overlay opacity: `0.08 → 0.90` over `1.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Tools row in bottom band slides down and fades: `0.4s ease`
- ⊕ mark fades out: `0.3s ease`
- Touch controls fade out: `0.4s ease`

**How user exits Poster mode:**
- Click/tap anywhere on the screenprint text → enters Explore mode
- Start panning or zooming the map → enters Explore mode
- Pinch gesture on mobile → enters Explore mode
- Any arrow key press (which also flips orientation) → enters Explore mode

### MODE 2: EXPLORE (user-triggered)

The screenprint recedes. The user is exploring the map. Tools become available.

**Screenprint overlay:**
- Opacity drops to `0.08` — a ghost/watermark/bleed-through effect, not invisible
- `pointer-events: none` — doesn't interfere with map interaction
- `mix-blend-mode: multiply` still active (the faint text tints the map subtly)
- This is NOT zero opacity — you can still faintly see the text like ink bleeding through the back of a page

**What becomes visible (staggered entrance, 150ms apart):**
1. ⊕ registration mark fades in (bottom-right corner of map frame) — `0.6s ease`
2. Touch flip controls fade in (mobile only) — `0.6s ease`
3. Flip hint appears (desktop, first visit only) — `0.6s ease`

**What stays visible:** top band, bottom band main row, everything from Poster mode minus the bold overlay.

**Zoom-based sub-states within Explore:**
- Zoom > 14: overlay drops to `0.04` opacity (almost gone)
- Zoom > 16: overlay goes to `0` (pure cartography — user is deep in street-level)
- Zoom < 3: Dymaxion crossfade kicks in (already built), overlay fades with it

**How user exits Explore mode:**
- Click the ⊕ registration mark → opens radial/vertical tool menu (stays in Explore)
- Click screenprint text (if visible at low zoom) → returns to Poster mode
- Press Escape key → returns to Poster mode
- Idle for 45 seconds with no interaction → gently returns to Poster mode (overlay drifts back up to 0.90 over 3s)

### MODE 3: MAKER (entered via ⊕ menu tools)

The user is customising their poster. Technically a sub-mode of Explore.

**Entered when:** user clicks ⌖ (Locate), T (Title edit), or color dot.

**Screenprint overlay during Maker:**
- Same 0.08 ghost opacity as Explore while editing
- When user confirms their edit (Enter, click away, or select a color), the overlay **snaps back to Poster mode** with the new content — dramatic reveal of their creation
- This snap-back is faster than normal: `0.6s ease` instead of `1.2s`
- A celebratory toast appears: "Your poster" / "Now it's yours" / "Claim it"

---

## The ⊕ Registration Mark & Tool Menu

### The ⊕ Element

Position: bottom-right of `#map-frame`, 16px from edges. z-index above map, below top/bottom bands.

```html
<button class="reg-mark" id="reg-mark" aria-label="Print tools">
  <svg width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="10" fill="none" stroke="var(--mid)" stroke-width="0.8"/>
    <line x1="14" y1="2" x2="14" y2="26" stroke="var(--mid)" stroke-width="0.8"/>
    <line x1="2" y1="14" x2="26" y2="14" stroke="var(--mid)" stroke-width="0.8"/>
  </svg>
</button>
```

Style: 28×28px, no background, no border, just the SVG. Color `var(--mid)` (#88898A). On hover: color transitions to `var(--ink)` (#000). Cursor: pointer.

**Only visible in Explore and Maker modes.** Fades in when entering Explore, fades out when returning to Poster.

**First-visit discovery cue:** The very first time the user enters Explore mode (track via `localStorage` flag `wud-explored`), the ⊕ mark does a single slow pulse animation: opacity `0.4 → 1 → 0.4` over 2.5s, once. Never repeats.

### The Tool Menu

Click ⊕ → menu fans out **upward** from the mark. Five items stacked vertically, staggered entrance (60ms apart, bottom to top).

```html
<div class="tool-menu" id="tool-menu">
  <a href="/story" class="tool-item" data-tool="story">
    <span class="tool-icon">?</span>
    <span class="tool-label">The story</span>
  </a>
  <a href="/" class="tool-item" data-tool="home">
    <span class="tool-icon">←</span>
    <span class="tool-label">Home</span>
  </a>
  <button class="tool-item" data-tool="share" id="tool-share">
    <span class="tool-icon">⤴</span>
    <span class="tool-label">Share</span>
  </button>
  <button class="tool-item" data-tool="download" id="tool-download">
    <span class="tool-icon">↓</span>
    <span class="tool-label">Download</span>
  </button>
  <button class="tool-item" data-tool="title" id="tool-title">
    <span class="tool-icon">T</span>
    <span class="tool-label">Make it yours</span>
  </button>
  <button class="tool-item" data-tool="locate" id="tool-locate">
    <span class="tool-icon">⌖</span>
    <span class="tool-label">Find me</span>
  </button>
</div>
```

Order bottom-to-top (closest to ⊕ first): ⌖ Find me, T Make it yours, ↓ Download, ⤴ Share, ← Home, ? Story. Creative tools closest to the mark, sharing in the middle, navigation furthest.

**Style per item:**
- 32px height, `display: flex; align-items: center; gap: 10px`
- Icon: 20×20px, `font-family: 'Space Mono'`, `font-weight: 700`, `font-size: 14px`, centered in a square
- Label: `font-family: 'Space Mono'`, `font-size: 9px`, `letter-spacing: 0.08em`, `text-transform: uppercase`, `color: var(--mid)`
- No background, no border. Hover: label color → `var(--ink)`, icon color → `var(--ink)`
- The whole thing right-aligned (sits against the right edge above the ⊕)

**Animation in:** each item translates from `translateY(8px), opacity: 0` to `translateY(0), opacity: 1`. 0.25s ease per item, 60ms stagger.

**Animation out (closing):** reverse stagger (top to bottom), 0.15s ease per item, 40ms stagger. Faster out than in.

**Close triggers:** click ⊕ again, click outside menu, press Escape, or select any tool item.

**"Make it yours" whisper:** The first time the menu opens (track via `localStorage` flag `wud-menu-opened`), the T item's label reads "Make it yours" and has a faint italic style (`font-family: 'Instrument Serif'`, `font-style: italic`, `color: var(--light)`). After first open, it permanently reads just "Title" in normal Space Mono. This is the single moment of invitation — then it becomes a tool, not a prompt.

---

## Tool: ⌖ Find Me (Geolocation)

Click → triggers `navigator.geolocation.getCurrentPosition()`.

**While locating:** the ⌖ icon in the menu pulses gently (opacity animation). Show a small toast: "Finding you..."

**On success:**
1. `map.flyTo({ center: [lon, lat], zoom: 13, bearing: currentBearing, duration: 2000 })`
2. Reverse geocode the position via Nominatim (same as existing `updateCityTitle`)
3. Update `#screenprint-l1` and `#screenprint-l2` with the place name, split intelligently:
   - If one word: line 1 = word, line 2 = empty (or a subtitle like the country)
   - If two words: one per line ("BUENOS" / "AIRES", "NEW" / "YORK")
   - If three+ words: first word on line 1, rest on line 2 ("SAN" / "FRANCISCO")
   - All caps, same Anton font
4. Update `#city-title` in top band
5. Snap overlay back to Poster mode with the new text (the reveal moment)
6. Toast: a location-aware message like "Your {city}, your rules" or "{city}, upside down"
7. Close the tool menu

**On failure (permission denied / error):** Toast "Couldn't find you — try searching instead". No other side effects.

**Note:** The existing geocoder (click title → search) remains as-is for manual search. The ⌖ is the one-tap automatic alternative.

---

## Tool: T Title Editor

Click → screenprint overlay becomes editable.

**Step 1: Enter edit mode**
1. Close the tool menu
2. Overlay opacity goes to `0.5` (halfway between ghost and full — enough to see what you're typing, but the map is still visible for spatial context)
3. Both `.screenprint-line` spans get `contenteditable="true"`
4. A blinking cursor appears (CSS `caret-color` matching the current screenprint color)
5. Existing text is selected (so typing immediately replaces it)
6. A **color strip** appears below the overlay text, horizontally centered in the map frame:

```html
<div class="color-strip" id="color-strip">
  <button class="color-dot active" data-color="#FF48B0" data-shadow="#F7FF00" aria-label="Pink + Yellow">
    <span class="dot-front" style="background:#FF48B0"></span>
    <span class="dot-back" style="background:#F7FF00"></span>
  </button>
  <button class="color-dot" data-color="#FF48B0" data-shadow="#0078BF" aria-label="Pink + Blue">
    <span class="dot-front" style="background:#FF48B0"></span>
    <span class="dot-back" style="background:#0078BF"></span>
  </button>
  <button class="color-dot" data-color="#F7FF00" data-shadow="#FF48B0" aria-label="Yellow + Pink">
    <span class="dot-front" style="background:#F7FF00"></span>
    <span class="dot-back" style="background:#FF48B0"></span>
  </button>
  <button class="color-dot" data-color="#000000" data-shadow="#FF48B0" aria-label="Black + Pink">
    <span class="dot-front" style="background:#000000"></span>
    <span class="dot-back" style="background:#FF48B0"></span>
  </button>
  <button class="color-dot" data-color="#000000" data-shadow="#88898A" aria-label="Black + Gray">
    <span class="dot-front" style="background:#000000"></span>
    <span class="dot-back" style="background:#88898A"></span>
  </button>
</div>
```

Color dots: 20px diameter circles, 12px gap. Each dot shows both inks in the pairing — the front circle filled with the main ink, a small crescent of the shadow ink peeking out behind at the offset direction (bottom-right), like a miniature overprint preview. Active dot gets a `2px solid var(--ink)` ring. The strip fades in with `0.4s ease`, each dot staggered 50ms.

```css
.color-dot {
  position: relative;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}
.dot-back {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  top: 2px;
  left: 2px;
}
.dot-front {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 1;
}
.color-dot.active {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
  border-radius: 50%;
}
```

**Step 2: User types**
- Text updates live in the `.screenprint-line` spans
- If user presses Enter in line 1, focus moves to line 2
- Max ~12 characters per line (wider text auto-scales down via `font-size: clamp(12vw, 21vw, 21vw)` — shrinks to fit)
- Color dot click → instantly updates `color` and `text-shadow` on both `.screenprint-line` elements using CSS custom properties `--sp-color` and `--sp-shadow`

**Step 3: Confirm**
- Press Escape, press Enter on line 2, click outside the overlay, or click a dedicated small ✓ button that appears next to the color strip
- Overlay snaps to Poster mode with the new text and color (`0.6s ease`)
- Color strip fades out
- `contenteditable` removed
- Toast: "Your poster" or "Claimed" or "Now it's yours" (random)
- Store the custom title in `sessionStorage` key `wud-custom-title` so it persists during the session (but not across sessions — each visit starts fresh with "UPSIDE DOWN")

**Orientation interaction:** If user flips orientation after customizing title, the custom text stays (don't revert to "UPSIDE" / "DOWN" / "NORTH UP" / "EAST WEST"). The flip still works — bearing changes, north arrow rotates — but the screenprint text is now the user's. Only a page refresh resets it.

---

## Tool: ↓ Download (Three Formats + Export Preview)

Click ↓ → a **format picker** fans out from the download button, showing three options. The user picks one, gets an **export preview** where they can customize the final image, then downloads or copies.

### Step 1: Format Picker

When ↓ is clicked in the tool menu, the other menu items fade out and three format cards replace them, stacked vertically above the ⊕:

```html
<div class="download-formats" id="download-formats">
  <button class="dl-format" data-format="poster">
    <span class="dl-format-preview poster-ratio"></span>
    <span class="dl-format-info">
      <span class="dl-format-name">Poster</span>
      <span class="dl-format-size">3600 × 4800</span>
    </span>
  </button>
  <button class="dl-format" data-format="reel">
    <span class="dl-format-preview reel-ratio"></span>
    <span class="dl-format-info">
      <span class="dl-format-name">Story / Reel</span>
      <span class="dl-format-size">1080 × 1920</span>
    </span>
  </button>
  <button class="dl-format" data-format="feed">
    <span class="dl-format-preview feed-ratio"></span>
    <span class="dl-format-info">
      <span class="dl-format-name">Feed</span>
      <span class="dl-format-size">1080 × 1080</span>
    </span>
  </button>
</div>
```

Format cards: right-aligned above the ⊕, staggered entrance (60ms apart, bottom to top). Each card is a row with a tiny aspect-ratio preview box on the left and the name + pixel size on the right.

**Style per card:**
- Height: 36px, `display: flex; align-items: center; gap: 10px`
- Preview box: outlined rectangle showing the aspect ratio. 24px tall, width proportional to ratio. `border: 1px solid var(--mid)`, `background: transparent`
  - Feed: 24×24px (square)
  - Reel: 13×24px (tall 9:16)
  - Poster: 18×24px (3:4)
- Name: `font-family: 'Space Mono'`, `font-size: 9px`, `font-weight: 700`, `letter-spacing: 0.06em`, `text-transform: uppercase`, `color: var(--mid)`
- Size: `font-family: 'Space Mono'`, `font-size: 7px`, `color: var(--light)`
- Hover: entire card, name and preview border → `var(--ink)`

**Close/back:** click outside or press Escape → returns to the tool menu.

### Step 2: Export Preview Overlay

After clicking a format, an **export preview** fills the map frame. This is the final customization step — the user sees exactly what they're about to create, like pulling a proof off the press.

```html
<div class="export-preview" id="export-preview">
  <div class="export-canvas" id="export-canvas">
    <!-- Live preview at chosen aspect ratio, showing map + screenprint text -->
  </div>
  <div class="export-controls">
    <div class="export-subtitle-row">
      <input type="text" class="export-subtitle" id="export-subtitle" 
             placeholder="Add a subtitle..." maxlength="60" spellcheck="false" />
    </div>
    <div class="export-options-row">
      <div class="color-strip" id="export-color-strip">
        <!-- Same 5 color dots as title editor -->
      </div>
      <div class="export-toggles" id="export-toggles">
        <!-- Feed/Reel only -->
        <label class="export-toggle"><input type="checkbox" checked data-toggle="compass"> ⊕</label>
        <label class="export-toggle"><input type="checkbox" checked data-toggle="coords"> 51°N</label>
        <label class="export-toggle"><input type="checkbox" checked data-toggle="url"> url</label>
      </div>
    </div>
    <div class="export-actions">
      <button class="export-btn export-btn-download" id="export-download">↓ Download</button>
      <button class="export-btn export-btn-copy" id="export-copy">⎘ Copy</button>
    </div>
  </div>
  <button class="export-close" id="export-close" aria-label="Close">×</button>
</div>
```

**Layout:**
- Semi-transparent dark background: `rgba(0, 0, 0, 0.75)`, `backdrop-filter: blur(4px)`
- Centered preview showing the map + screenprint text at the chosen aspect ratio, sized to fit within the map frame with padding
- Below the preview: controls area

**The subtitle field:**
- Pre-filled with the current cycling subtitle phrase (e.g. "an exercise in unlearning north")
- The user can edit it to anything: a date, a dedication, coordinates, a manifesto line, or clear it entirely
- On the export, this subtitle renders below the main screenprint text in Instrument Serif italic, ~40% of the main text size, same color at 60% opacity
- Style: `font-family: 'Instrument Serif'`, `font-style: italic`, `font-size: 12px`, `color: var(--sp-color)`, `opacity: 0.6`, `text-align: center`
- The input field itself: `border: none`, `border-bottom: 1px solid var(--light)`, `background: transparent`, `color: var(--paper)`, `font-family: 'Instrument Serif'`, `font-style: italic`, `font-size: 12px`, centered text

**Color strip:** same 5 riso ink dots as the title editor. Allows last-second color change without going back. Active dot has `2px solid var(--paper)` ring (white ring on dark background).

**Toggles (Feed and Reel only, hidden for Poster):**
- Three small toggles for optional watermark elements:
  - `⊕ compass` — small compass rose SVG in corner (64×64px, 30% opacity)
  - `51°N coords` — current view coordinates in Space Mono 7px at bottom edge
  - `url` — "upside-down.vercel.app" in Space Mono 7px at bottom margin
- All checked by default. User can toggle off for a cleaner image.
- Style: `font-family: 'Space Mono'`, `font-size: 8px`, `color: var(--paper)`, `opacity: 0.6`. Checkboxes styled as small squares with riso aesthetic.

**For Poster format:** toggles are replaced with a static line: "Includes compass, scale, legend, credit" in 8px Space Mono, `var(--paper)` at 40% opacity. The poster is the full artifact — not configurable.

**Action buttons:**
- `↓ Download`: `font-family: 'Space Mono'`, `font-size: 9px`, `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`, `background: var(--paper)`, `color: var(--ink)`, `border: none`, `padding: 8px 20px`, hover inverts to `background: var(--ink)`, `color: var(--paper)`
- `⎘ Copy`: same style but `background: transparent`, `color: var(--paper)`, `border: 1px solid var(--paper)`. Uses `navigator.clipboard.write()` to put the image on clipboard directly. Toast: "Copied — paste it anywhere"

**Close:** × button top-right of the overlay, or press Escape. Returns to Explore mode.

### The Three Formats

**1. Feed (Instagram square)**
- Output: `1080 × 1080px` PNG
- Layout: map fills the square. Screenprint text centered vertically. Custom subtitle below if entered. No top/bottom bands. Credit line bottom-right: "Gerardo Ezequiel · upside-down.vercel.app" in 9px Space Mono, `var(--mid)` opacity 0.5. Optional: compass, coords, url watermarks per toggle state.
- Map viewport cropped to 1:1 square centered on current view.
- Filename: `upside-down-feed-{city}.png`

**2. Story / Reel (Instagram vertical)**
- Output: `1080 × 1920px` PNG (9:16)
- Layout: map fills the tall frame. Screenprint text positioned in upper third (breathing room below). Custom subtitle under the main text. Credit line bottom-right. Optional watermarks per toggle state.
- Map viewport cropped to 9:16 rectangle centered on current view.
- Filename: `upside-down-reel-{city}.png`

**3. Poster (classic frame)**
- Output: `3600 × 4800px` PNG (3:4, fits 18×24", 24×32", A2, A3 frames)
- Layout: the **full artifact** — top band, map with screenprint overlay + subtitle, bottom band with compass/scale/legend/author credit. Trim marks visible. This is the museum-quality print version.
- **QR code:** bottom-right corner of the poster, 48×48px, rendered in `var(--mid)` at 40% opacity. Encodes the shareable URL (see Shareable URLs below) so someone who prints and frames the poster gives viewers a way to scan and open the same map on their phone. Generated client-side with a lightweight library like `qrcode-generator`.
- Filename: `upside-down-poster-{city}.png`

### Capture Sequence (all formats)

1. User clicks Download or Copy in the export preview
2. Export preview shows a brief generating state (the preview pulses gently)
3. Overlay transitions to full Poster opacity — `0.3s`
4. Hide all UI: ⊕ mark, menus, touch controls, flip hint, toasts, export preview itself
5. Wait one frame (`requestAnimationFrame`)
6. **For Feed and Reel:** create an offscreen `<canvas>` at target resolution. Draw `map.getCanvas()` cropped/scaled to target aspect ratio. Render screenprint text (Anton font, matching color/shadow). Render subtitle (Instrument Serif italic). Render optional watermarks (compass SVG, coords text, URL text) per toggle state. Render credit line. Export as PNG.
7. **For Poster:** use `html2canvas` on `#page` at 3× scale (or a dedicated export container that mirrors the page layout at print resolution). Render QR code onto the canvas. This captures bands, legend, scale bar — the full artifact.
8. **If Download:** trigger file download with appropriate filename
9. **If Copy:** use `navigator.clipboard.write()` with the PNG blob. Falls back to download if clipboard API unavailable.
10. Restore Explore mode
11. Toast per format:
    - Feed: "Ready for the grid"
    - Reel: "Swipe up on that"
    - Poster: "Print it. Frame it. Flip someone's world."
    - Copy (any): "Copied — paste it anywhere"

**Resolution notes:**
- Feed/Reel: render at exactly 1080px wide (Instagram native). Map canvas at sufficient DPR to avoid blurriness.
- Poster: render at 3600×4800 (300 DPI at 12×16"). Print-shop quality.
- All formats: screenprint text must be crisp. If using canvas text rendering, match Anton font metrics exactly. If using html2canvas, ensure the font is loaded before capture.

**Important:** the downloaded/copied images contain NO UI buttons, no ⊕ mark, no tool menu, no flip controls. Just the artifact.

---

## Tool: ⤴ Share

A dedicated share tool in the ⊕ menu. Shares the current map state as a URL.

**On mobile:** triggers `navigator.share()` with the shareable URL and a text like "I flipped the world upside down. {url}". The native share sheet opens — the user can send to Instagram, WhatsApp, Twitter, Messages, whatever.

**On desktop:** copies the shareable URL to clipboard. Toast: "Link copied — spread the disorientation."

**Shareable URL format:** see Shareable URLs section below.

---

## Shareable URLs

The current `hash: true` on MapLibre persists position as `#zoom/lat/lng`. Extend this to encode the full custom state:

```
upside-down.vercel.app/map#13/51.507/-0.128/180/t:BUENOS+AIRES/c:pink
```

Hash parameters:
- `13` — zoom level (existing)
- `51.507/-0.128` — lat/lng (existing)
- `180` — bearing (existing, but currently not encoded — add it)
- `t:BUENOS+AIRES` — custom title (URL-encoded, `+` for spaces). Omitted if default.
- `c:pink` — color name (`yellow`, `pink`, `teal`, `blue`, `black`). Omitted if default yellow.

When someone opens a URL with custom title/color parameters:
1. Map loads at the encoded position and bearing
2. Screenprint overlay shows the custom title in the specified color
3. The `hasCustomTitle` flag is set (so orientation flips don't overwrite it)
4. The page starts in **Poster mode** with the custom text — the viewer sees the shared poster immediately

This makes every customized map a unique, shareable URL. Text it, post it, bookmark it. The poster travels as a link, not just as an image.

**Parsing:** on page load, after MapLibre processes the standard `#zoom/lat/lng` hash, check for additional `/t:` and `/c:` segments. Apply them before the first render. Be careful not to conflict with MapLibre's hash handling — the custom params should be appended after the standard hash and parsed separately.

**Updating:** whenever the user customizes the title or color (via T editor or ⌖ locate), update the URL hash to include the new parameters. Use `history.replaceState` to avoid polluting browser history.

---

## OG Image Generation (Phase 4 — Future)

When a shareable URL with custom title/color is posted on social media, the Open Graph preview image (`og:image`) should dynamically reflect the custom poster. This requires a Vercel Edge Function or OG image endpoint that:

1. Reads the URL hash parameters (title, color, lat/lng/zoom)
2. Renders a static map tile (using a static tile API or pre-rendered snapshot)
3. Overlays the screenprint text in the specified color
4. Returns a 1200×630 image for social previews

This is a separate implementation — note it in the architecture but don't build it in Phase 1–3. For now, the default `og-image.png` is used for all shares.

---

## Design System Details

### Riso Ink Palette

The project uses six Riso Kagaku spot inks. **All colors must use these exact hex values** — they correspond to real ink formulations:

| Ink | Pantone | Hex | CSS Variable |
|---|---|---|---|
| Black | Black U | `#000000` | `var(--ink)` |
| Light Gray | 424 U | `#88898A` | `var(--mid)` |
| Teal | 321 U | `#00838A` | `var(--teal)` |
| Blue | 3005 U | `#0078BF` | `var(--blue)` |
| Fluor Pink | 806 U | `#FF48B0` | `var(--pink)` |
| Yellow | — | `#F7FF00` | `var(--yellow)` |

Do NOT substitute approximations (e.g. `#FFE627` is not riso yellow, `#C4305C` is not a riso ink). Both colors in every screenprint pairing must be real inks from this table.

### Two-Pass Overprint System

The screenprint text simulates a real two-pass print: one ink laid down first (the back/shadow pass), then a second ink on top (the front/main pass), slightly offset. Where they overlap, `mix-blend-mode: multiply` creates an authentic overprint third color.

**Critical implementation change:** Replace `text-shadow` with **two separate text elements**. CSS text-shadow renders behind the text as a flat color — it doesn't blend with the front text through multiply. To get the real overprint third color (e.g. hot orange where yellow overlaps pink), you need two DOM elements that both multiply against the map AND against each other.

```html
<div class="screenprint-overlay" id="screenprint-overlay">
  <div class="screenprint-line-group">
    <span class="screenprint-line screenprint-pass-back" id="screenprint-l1-back">UPSIDE</span>
    <span class="screenprint-line screenprint-pass-front" id="screenprint-l1">UPSIDE</span>
  </div>
  <div class="screenprint-line-group">
    <span class="screenprint-line screenprint-pass-back" id="screenprint-l2-back">DOWN</span>
    <span class="screenprint-line screenprint-pass-front" id="screenprint-l2">DOWN</span>
  </div>
</div>
```

```css
.screenprint-line-group {
  position: relative;
  display: block;
}

.screenprint-line {
  font-family: 'Anton', sans-serif;
  font-size: clamp(12vw, 21vw, 21vw);
  text-transform: uppercase;
  line-height: 0.85;
  mix-blend-mode: multiply;
  filter: url(#riso-rough);
}

.screenprint-pass-back {
  color: var(--sp-shadow);
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(var(--sp-offset-x), var(--sp-offset-y));
  z-index: 1;
}

.screenprint-pass-front {
  color: var(--sp-color);
  position: relative;
  z-index: 2;
}
```

Both passes have `mix-blend-mode: multiply`. The back pass is offset. Where they overlap, the browser does the multiply math — giving you the authentic overprint third color. Three colors from two inks.

**The offset must be intentional, not subtle.** A 4px offset says "sorry, the printer slipped." A larger offset says "I ran this through the drum twice and I meant it." The reference: Dave Buonaguidi's screenprints use roughly 1.5–2% of the print width as offset.

```css
:root {
  --sp-offset-x: clamp(8px, 1.5vw, 16px);
  --sp-offset-y: clamp(6px, 1.2vw, 12px);
}
```

At mobile (~375px): ~6px offset. At desktop (1200px+): ~18px. The two passes are visibly separate at normal viewing distance, with a clear overlap zone.

**When the user edits text (T tool or ⌖ locate), both the front and back pass spans must update in sync.** The back pass mirrors the front pass text exactly, just offset and in the shadow color.

### Color Pairings for the Color Strip

Five pairings, each using two real inks from the palette. Chosen for: (1) overprint third-color quality, (2) contrast against the teal/blue/gray map, and (3) what a real print shop would run.

| # | Name | Front ink (main) | Back ink (shadow) | Overlap color | Character |
|---|------|------|--------|------|-------|
| 1 | **Pink + Yellow** | `#FF48B0` | `#F7FF00` | `#F74800` hot orange | **Default.** Maximum riso energy. Pink pops hardest against teal/blue map (complementary). Like NORF SARF. |
| 2 | Pink + Blue | `#FF48B0` | `#0078BF` | `#002284` deep violet | Cool/warm tension. Rich, complex. Gig poster feel. |
| 3 | Yellow + Pink | `#F7FF00` | `#FF48B0` | `#F74800` hot orange | Same overlap, but yellow leads — lighter, solar. Best over dark/dense map areas (cities). |
| 4 | Black + Pink | `#000000` | `#FF48B0` | `#000000` (absorbs) | Pink ghost behind black text. Militant but playful. Protest poster aesthetic. |
| 5 | Black + Gray | `#000000` | `#88898A` | `#000000` | Monochrome. Just ink density. The "serious cartographer" option. Reads cleanest. |

**Why Pink is the default, not Yellow:** Yellow (`#F7FF00`) is the lightest, most transparent riso ink. At `multiply` blend mode over the map's teal water and light paper, it turns muddy olive or disappears. Fluorescent Pink is the loudest riso ink — maximum complementary contrast against the cool-dominant map palette. It's the ink of protest signs, zine covers, and rave flyers. It doesn't belong on serious cartography. That's exactly why it belongs on THIS map.

**Color dot design in the strip:** Each 20px dot shows both inks. The main circle is filled with the front ink color. A small crescent of the back ink peeks out from behind at the offset direction (bottom-right), like a miniature misregistration preview. This way the user sees the pairing, not just a single color.

**Note on the map palette conflict:** Teal and Blue are deliberately excluded as front (main) inks in the pairings because they'd be near-invisible over the map's own teal water and blue labels. They could work as shadow inks behind higher-contrast fronts.

### SVG Ink Texture Filter

Add an SVG filter to `map.html` (inside a hidden `<svg>` at the top of `<body>`):

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="riso-rough">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

Apply to screenprint text: `.screenprint-line { filter: url(#riso-rough); }`. This gives the text edges a subtle roughness like real screen-printed ink on textured paper. The displacement is tiny (1.5px) — just enough to break the digital perfection.

### Trim Marks

Add four corner trim marks inside `#map-frame` — thin gray lines that look like crop/registration marks on a printer's proof:

```html
<div class="trim-marks" aria-hidden="true">
  <span class="trim-mark tl"></span>
  <span class="trim-mark tr"></span>
  <span class="trim-mark bl"></span>
  <span class="trim-mark br"></span>
</div>
```

```css
.trim-mark {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 5;
  pointer-events: none;
}
.trim-mark::before, .trim-mark::after {
  content: '';
  position: absolute;
  background: var(--mid);
  opacity: 0.25;
}
.trim-mark::before { /* horizontal line */ width: 16px; height: 0.5px; }
.trim-mark::after { /* vertical line */ width: 0.5px; height: 16px; }
.trim-mark.tl { top: 8px; left: 8px; }
.trim-mark.tr { top: 8px; right: 8px; }
.trim-mark.bl { bottom: 8px; left: 8px; }
.trim-mark.br { bottom: 8px; right: 8px; }
```

Always visible in both modes. They're authentic print elements.

---

## Bottom Band Changes

### Remove nav links from bottom band

Move `← Home` and `Story →` links OUT of `#bot-band`. They are website navigation, not cartographic elements. They now live in the ⊕ tool menu only.

Remove the entire `.bot-links` div and `.bot-sep` elements from `#bot-band`. Keep the `.bot-link-author` (Gerardo Ezequiel + LinkedIn icon) — that's a maker's mark and belongs on the print.

The bottom band should now contain only:
1. Scale block (north arrow + scale bar + ratio)
2. Legend block (5-colour riso legend)
3. Author credit (right-aligned)

All three are cartographic elements that belong on a printed map.

### Author Credit

The author name "Gerardo Ezequiel" should be more prominent — on a real screenprint, the artist's name is part of the work, not hidden metadata.

- `font-family: 'Space Mono'`, `font-size: 10px`, `font-weight: 700`, `letter-spacing: 0.1em`, `text-transform: uppercase`
- Right-aligned in the bottom band, same baseline as the legend
- Keep the LinkedIn icon link, but the name itself should be readable at a glance
- On **exports**, the credit renders as a proper maker's mark:
  - Feed/Reel: "Gerardo Ezequiel · upside-down.vercel.app" in ~9px equivalent, `var(--mid)` at 50% opacity, bottom-right corner
  - Poster: same text but larger (~11px equivalent), full opacity, integrated with the bottom band

### No tools row in bottom band

All tools live in the ⊕ radial menu. The bottom band does NOT get a second row. This keeps it clean for screenshots and downloads.

---

## Top Band Changes

### Title / Geocoder (keep as-is)

The `#city-title` click → geocoder behavior is already built and works. Don't change it.

Keep the search hint `⌕` that appears on hover over the title. Keep the subtitle cycling animation.

### Add Story link to subtitle

Make the subtitle text itself a link. Wrap `#subtitle-text` in an `<a href="/story">` tag. Style: no underline by default, underline on hover, same color. This is subtle — only curious users will discover it, and those are exactly the users who want the story.

---

## Mobile Considerations

### Touch flip controls (existing `.touch-controls`)

Keep the existing flip buttons but only show them in **Explore mode**. In Poster mode they're hidden — the poster is the hero. Same fade-in timing as desktop Explore mode entry.

Restyle to match the print aesthetic better:
- Remove `backdrop-filter: blur(6px)` and the glass-morphism look
- Use: `background: var(--paper)`, `border: 1.5px solid var(--ink)`, `border-radius: 0`
- This makes them feel like print-press buttons, not iOS widgets

### ⊕ on mobile

Same position (bottom-right of map frame), but slightly larger hit target: 44×44px touch area around the 28×28 visual mark (use padding).

### Color strip on mobile (title editor)

Instead of horizontal below the text, stack vertically on the right edge of the map frame. Same dots, vertical layout, 10px gap.

### Gestures

- Single tap on screenprint text → toggle Poster/Explore (same as click)
- Two-finger pinch to zoom → enters Explore mode (same as scroll zoom)
- No swipe gestures (conflict with map pan)

---

## Idle Return to Poster Mode

If the user is in Explore mode and doesn't interact for 45 seconds:

1. Overlay drifts from `0.08 → 0.90` over `3s ease-in-out` (slow, gentle, like a poster settling)
2. ⊕ mark fades to `0.3` opacity (dimmed but not gone — user can still tap it)
3. Touch controls fade out
4. Any mouse move, touch, scroll, or key press **immediately** cancels the drift and snaps back to Explore mode

This creates a living, breathing quality — the poster keeps reasserting itself, the way a screenprint on a wall is always there whether you're looking at it or not.

---

## Orientation Changes × Screenprint Text

Current behavior: flipping orientation changes the text ("UPSIDE DOWN" / "NORTH UP" / "EAST WEST") and briefly flashes the overlay before dimming again.

**New behavior:**

If the user has NOT customized the title (no T edit, no ⌖ locate):
- Orientation change updates text as before: `UPSIDE DOWN` / `NORTH UP` / `EAST WEST`
- Overlay briefly pulses to `0.60` opacity for 1.5s, then returns to its current mode's opacity
- This pulse is faster than a full mode change — it's a flash of the new text, not a return to Poster mode

If the user HAS customized the title:
- Orientation change does NOT alter the screenprint text (their custom text stays)
- The bearing/mirror still changes, north arrow still rotates
- The overlay does a subtle pulse (`0.08 → 0.15 → 0.08` over 0.8s) to acknowledge the flip
- Toast still fires with the witty orientation message

---

## CSS Custom Properties to Add

```css
:root {
  /* Screenprint ink pairing (updated by color picker) */
  --sp-color: #FF48B0;       /* Fluor Pink 806 U — front/main pass */
  --sp-shadow: #F7FF00;      /* Yellow — back/shadow pass */
  --sp-offset-x: clamp(8px, 1.5vw, 16px);  /* ~6px mobile, ~18px desktop */
  --sp-offset-y: clamp(6px, 1.2vw, 12px);
  
  /* Mode transition */
  --overlay-opacity: 0.90;
  --overlay-transition: 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

The two-pass structure (see Design System > Two-Pass Overprint System) replaces text-shadow entirely:
```css
.screenprint-pass-front {
  color: var(--sp-color);
  mix-blend-mode: multiply;
  filter: url(#riso-rough);
  transition: color 0.4s ease;
}
.screenprint-pass-back {
  color: var(--sp-shadow);
  mix-blend-mode: multiply;
  filter: url(#riso-rough);
  transform: translate(var(--sp-offset-x), var(--sp-offset-y));
  transition: color 0.4s ease, transform 0.4s ease;
}
```

Update `#screenprint-overlay` to use:
```css
#screenprint-overlay {
  opacity: var(--overlay-opacity);
  transition: opacity var(--overlay-transition);
}
```

Mode changes update `--overlay-opacity` via JavaScript:
- Poster: `0.90`
- Explore: `0.08`
- Explore zoom >14: `0.04`
- Explore zoom >16: `0`
- Maker editing: `0.50`

---

## State Machine Summary

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌─────────┐  click text / pan / zoom / key   ┌─────────┐  │
│ POSTER  │ ──────────────────────────────→  │ EXPLORE │  │
│ (view)  │                                  │ (map)   │  │
│         │ ◄──────────────────────────────  │         │  │
└─────────┘  click text / Esc / idle 45s     └────┬────┘  │
                                                  │       │
                                            click ⊕       │
                                                  │       │
                                                  ▼       │
                                            ┌─────────┐   │
                                            │ MENU    │   │
                                            │ (tools) │   │
                                            └────┬────┘   │
                                                 │        │
                         ┌──────┬──────┬──────┼────────┤
                         │      │      │      │        │
                         ▼      ▼      ▼      ▼        │
                      ⌖ Find  T Edit  ↓ Down  ⤴ Share   │
                      me      title   load    (url/     │
                         │      │      │     native)   │
                         │      │      ▼               │
                         │      │   ┌─────────┐        │
                         │      │   │ EXPORT  │        │
                         │      │   │ PREVIEW │        │
                         │      │   │ subtitle│        │
                         │      │   │ color   │        │
                         │      │   │ toggles │        │
                         │      │   └────┬────┘        │
                         │      │        │             │
                         └─────┴────────┴─────────────┘
                              confirm / download / copy
                                        │
                                        ▼
                                 → POSTER mode
                                   with new content
```

---

## Implementation Priority

**Phase 1 — Core mode system and overprint (do first):**
1. Replace current `dimmed/faded/hidden` classes with CSS custom property `--overlay-opacity` approach
2. Replace single-span `text-shadow` screenprint with **two-pass DOM structure** (front + back spans per line, both `mix-blend-mode: multiply`)
3. Set default pairing to Pink `#FF48B0` (front) + Yellow `#F7FF00` (back)
4. Set offset to `clamp(8px, 1.5vw, 16px)` / `clamp(6px, 1.2vw, 12px)` (bigger than current 4–5px)
5. Implement `poster` / `explore` / `maker` state machine in main.ts
6. Make screenprint text clickable as Poster → Explore toggle
7. Add idle-return timer
8. Add SVG `riso-rough` filter
9. Add trim marks
10. Bump author credit to 10px bold Space Mono

**Phase 2 — ⊕ menu and tools:**
1. Add ⊕ registration mark element
2. Build tool menu with fan animation (6 items: ⌖, T, ↓, ⤴, ←, ?)
3. Implement ⌖ geolocation tool
4. Implement T title editor with contenteditable
5. Implement color strip picker
6. Wire up CSS custom properties for live color switching
7. Move Home/Story from bottom band into ⊕ menu

**Phase 3 — Export system:**
1. Implement format picker (Feed 1080×1080, Reel 1080×1920, Poster 3600×4800)
2. Build export preview overlay with live preview at chosen aspect ratio
3. Add editable subtitle field (pre-filled from cycling subtitle)
4. Add optional watermark toggles for Feed/Reel (compass, coords, url)
5. Implement canvas capture for Feed/Reel (offscreen canvas compositing)
6. Implement html2canvas capture for Poster (full artifact at 3× scale)
7. Implement ⎘ Copy button (`navigator.clipboard.write()`)
8. Render QR code on Poster export (encodes shareable URL)

**Phase 4 — Sharing and polish:**
1. Implement ⤴ Share tool (native share on mobile, clipboard on desktop)
2. Encode custom title + color in URL hash (shareable URLs)
3. Parse custom hash params on page load (restore shared posters)
4. Restyle mobile touch controls (remove glass-morphism)
5. First-visit discovery cues (⊕ pulse, "make it yours" label)
6. SessionStorage for custom title persistence
7. Add Story link to subtitle text

**Phase 5 — Future:**
1. OG image generation via Vercel Edge Function (dynamic `og:image` from URL params)
2. PDF export option for Poster format (jsPDF)
3. Edition numbering on Poster exports ("1/1 · February 2025")

---

## Things NOT to Change

- The map style, tile source, or riso palette
- The misregistration engine in riso.ts
- The Dymaxion projection crossfade
- The graticule system
- The scale bar renderer
- The subtitle typing animation
- The ambient toast system (but DO integrate new maker toasts into it)
- The geocoder search (click title → search bar)
- The hash-based URL position persistence
- The existing orientation system (arrow keys, flip buttons, bearing lock)

---

## Testing Checklist

**Mode system:**
- [ ] Page loads in Poster mode, text at 0.90 opacity, no tools visible
- [ ] Click screenprint text → Explore mode, text ghosts to 0.08, ⊕ appears
- [ ] Pan/zoom map → same transition to Explore
- [ ] Escape from anywhere → returns to Poster
- [ ] 45s idle → soft return to Poster, any interaction cancels
- [ ] Zoom >16 → text fully hidden regardless of mode
- [ ] Zoom <3 → Dymaxion crossfade still works
- [ ] Arrow keys still flip orientation

**⊕ menu:**
- [ ] ⊕ click → 6-item menu fans out with stagger animation
- [ ] Click outside / Esc / select tool → menu closes
- [ ] First-visit ⊕ pulse animation plays once, never repeats
- [ ] First-visit "Make it yours" italic label shows once, then becomes "Title"
- [ ] Home and Story links navigate correctly
- [ ] Mobile: ⊕ has 44px touch target

**Tools:**
- [ ] ⌖ → geolocation prompt → fly to location → text updates → returns to Poster
- [ ] ⌖ failure → toast "Couldn't find you", no side effects
- [ ] T → text becomes editable → color strip appears → type → confirm → Poster with new text
- [ ] Color dot click → text color + shadow updates live
- [ ] Custom title persists through orientation flips (text stays, bearing changes)
- [ ] Custom title persists through session (sessionStorage)
- [ ] Mobile: touch controls appear in Explore, hide in Poster

**Export system:**
- [ ] ↓ → format picker shows three cards (Feed, Reel, Poster)
- [ ] Click format → export preview overlay appears with live preview
- [ ] Subtitle field pre-filled with current cycling phrase, editable
- [ ] Color dots in preview allow last-second color change
- [ ] Feed/Reel: watermark toggles (compass, coords, url) work
- [ ] Poster: toggles replaced with static "Includes..." line
- [ ] Download button → captures image at correct resolution, downloads with correct filename
- [ ] Copy button → image placed on clipboard (falls back to download if unavailable)
- [ ] Feed export: 1080×1080, no bands, credit line visible
- [ ] Reel export: 1080×1920, text in upper third, credit line visible
- [ ] Poster export: 3600×4800, full artifact with bands/legend/scale/credit, QR code in corner
- [ ] All exports: NO UI buttons, no ⊕, no tool menu, no flip controls
- [ ] Author credit "Gerardo Ezequiel" readable on all formats
- [ ] Custom text + subtitle appear on exports

**Sharing:**
- [ ] ⤴ Share on mobile → native share sheet opens with URL
- [ ] ⤴ Share on desktop → URL copied to clipboard, toast confirms
- [ ] Custom title + color encoded in URL hash
- [ ] Opening shared URL → map loads at correct position with custom text + color in Poster mode
- [ ] QR code on Poster export encodes correct shareable URL

**Design polish:**
- [ ] Trim marks visible in both modes
- [ ] SVG rough filter applied to text edges
- [ ] Author credit 10px bold Space Mono, right-aligned in bottom band
- [ ] Warm yellow `#FFE627` used (not `#F7FF00`)
