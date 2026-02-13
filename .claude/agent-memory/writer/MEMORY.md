# Writer Agent Memory

## Project Voice
- Tone: clever, slightly provocative, self-aware. References cartographic colonialism but keeps it fun and shareable.
- The project subtitle is "An Exercise in Unlearning North."
- Key references: Apollo 17 Blue Marble (south-up original), Torres Garcia ("Nuestro norte es el Sur"), Stuart McArthur (corrective map), Buckminster Fuller (no up in space), al-Idrisi (1154 south-up map).
- The landing page is a Swiss riso editorial design: Space Grotesk, 5-drum risograph aesthetic, counter-cartography content.

## Toast System
- File: `src/orientation.ts` (lines 5-48)
- Three orientations: normal, upside-down, mirrored
- Location toasts use `{city}` placeholder, triggered 40% of the time
- Toast duration: 2200ms. Messages must be under ~50 chars to read in time.
- Mobile FAB only toggles upside-down/normal (no mirrored on mobile)
- Share text lives in `src/tools/share.ts` (getShareText function)

## Style Notes
- British English throughout (colour, organise, centre)
- No em dashes; use colons, semicolons, full stops
- No Oxford comma unless clarity requires it
- No style-guide.md or argument-mapping.md found in .claude/docs/ as of 2026-02-13

## Content Deliverables
- Toast messages doc written to `docs/TOAST-MESSAGES.md` (2026-02-13)
