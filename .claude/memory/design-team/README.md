# Design Team Memory

## Design Identity
- Swiss editorial meets risograph printing
- Maps as screenprinted art, not digital products
- Tone: intellectually playful, like a well-designed protest poster

## Riso Specifications
- 34 Riso Kagaku spot inks from real catalogue
- 19 typefaces with 6 curated pairings
- 6 style presets (ink palette + font pairing combinations)
- Halftone dots, misregistration offsets, paper grain, screenprint overlay
- See `src/ink-palette.ts` and `src/font-system.ts` for implementation

## Visual System
- Full-page WebGL Bayer dither background at z-index 0
- Content sections elevated to z-index 1
- Scale bar: SVG, metric, mathematically accurate
- Graticule: zoom-dependent intervals (30/10/5/1 degree)

## Responsive Approach
- Mobile: flip buttons for orientation
- Desktop: poster mode (static) / explore mode (interactive) / maker mode (customise)
- See `src/mode-system.ts` for mode transitions

## CSS Architecture
- `src/landing.css` — Swiss riso editorial design system
- `src/style.css` — map-specific styles
- No CSS framework; handwritten with design system variables

## Design QA Checklist
- Riso ink colours match catalogue values
- Misregistration offsets are subtle (1-2px)
- Typography hierarchy: title > subtitle > body > micro
- All interactive elements have hover/active states
