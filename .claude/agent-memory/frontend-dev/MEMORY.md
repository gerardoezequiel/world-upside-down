# Frontend Dev Agent Memory

## CSS Architecture
- `src/landing.css` — Landing page styles (Swiss riso editorial)
- `src/style.css` — Map app styles
- CSS custom properties for theming (--overlay-opacity, --overlay-transition)
- Mobile breakpoints: phone (<600px), tablet (<900px)
- Safe area insets for notched devices

## Key UI Patterns
- **Modes**: poster (idle, overlay visible), explore (map interaction), maker (export/customize)
- **Toolbar**: 7 icon buttons in `#toolbar` — locate, title, style, globe, download, share, story link
- **Dropdowns/bottom sheets**: Desktop = dropdowns, mobile = bottom sheets
- **Flip FAB**: Mobile-only floating action button for orientation toggle
- **Toast**: `#flip-toast` with .show class, 2200ms duration, 3000ms cooldown
- **Screenprint overlay**: Full-screen poster with title text, fades on interaction
- **North arrow**: Rotates on orientation change via .flipped class

## Mobile Considerations
- Touch targets minimum 44px
- Phone hides: subtitle, coords, title editor, globe button (very small)
- Bottom sheets replace dropdown panels
- Native Web Share API with fallback to copy link
- Pinch-to-zoom: pointer-events removed from poster overlay to allow

## Export System
- Canvas-based PNG at 3 sizes: feed (1080x1080), reel (1080x1920), poster (3600x4800)
- Uses `preserveDrawingBuffer: true` on map for canvas capture
- html2canvas ^1.4.1 for overlay capture
