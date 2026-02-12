# World Upside Down

Interactive cartographic art tool. Riso-printed screenprint aesthetic over a flipped MapLibre map.

## Quick commands

```bash
npm run dev      # Vite dev server on :5174
npm run build    # tsc (type-check only, noEmit) + vite build
npm run preview  # Preview production build
```

## Architecture

**Three entry points** (multi-page Vite app):
- `index.html` — landing page (Three.js dither globe, inline `<script>`)
- `map.html` — main map app (MapLibre GL JS)
- `story.html` — editorial scroll story

**Map app** (`map.html` + `src/main.ts`):
- `main.ts` is a thin orchestrator (~140 lines) that wires modules together
- All modules share a single `AppState` object created in `map-state.ts`
- Each module exports `setup*(state: AppState)` or pure functions

## Module map

```
src/
  main.ts              ← Orchestrator: creates map, calls all setup functions
  map-state.ts         ← AppState type + createAppState() factory. Central shared state.
  recolor-style.ts     ← Pure function: recolorStyle(palette, style) → MapLibre style
  ink-palette.ts       ← Riso ink catalog, palette presets, buildDerivedPalette()
  font-system.ts       ← 19 fonts, 6 pairings, style presets, apply/persist helpers
  riso.ts              ← Riso ink hex values + paper color constants
  style-system.ts      ← Style panel UI: presets, ink customizer, font customizer
  mode-system.ts       ← Poster/explore/maker mode state machine + idle timer
  orientation.ts       ← Upside-down/normal/mirrored bearing + flip buttons
  geocoding.ts         ← Nominatim reverse/forward geocoding + search UI
  scale-bar.ts         ← SVG scale bar + lat/lon/zoom coordinates display
  graticule.ts         ← Lat/lon grid overlay (GeoJSON source + layer)
  riso-effects.ts      ← Misregistration offset duplicate layers
  ticker.ts            ← Scrolling place-name ticker animation
  subtitle.ts          ← Typewriter subtitle phrase rotation
  shareable-urls.ts    ← URL hash encode/decode for sharing state
  tools/
    locate.ts          ← Geolocation button
    title.ts           ← Contenteditable screenprint title editor
    globe.ts           ← Mercator/Globe projection toggle
    download.ts        ← Export to PNG (feed/reel/poster sizes)
    share.ts           ← LinkedIn/X/copy share links
  dymaxion.ts          ← Dymaxion (Fuller) projection canvas overlay
  dither-globe.ts      ← Three.js Bayer-dithered spinning globe
  globe-textures.ts    ← Texture generation for the Three.js globe
  projection-cards.ts  ← Projection comparison cards for story page
  landing-init.ts      ← Landing page initialization
  analytics.ts         ← Vercel Analytics
```

## Key patterns

- **Shared state**: All mutable state lives in `AppState` (map-state.ts). Modules receive it as a parameter.
- **Named exports only**: No default exports. Easy to grep and trace.
- **Pure functions where possible**: `recolorStyle`, `buildDerivedPalette`, `parseShareableHash` take data in, return data out.
- **DOM in setup functions**: Each `setup*()` function owns its DOM element lifecycle.

## Interaction rules

- **Clarify before executing**: If a request is ambiguous, ask 1-4 targeted questions before writing code. Use `AskUserQuestion` with concrete options, not open-ended queries. If genuinely vague, invoke `/prompt-improver`.
- **Plan before executing**: For any non-trivial task (3+ files, architectural decisions, multiple valid approaches), enter plan mode first. Read relevant code, check memory, then present an approach for approval.
- **Be critical**: Evaluate the user's request against project architecture and conventions. If a request would create technical debt, conflict with existing patterns, or miss a better approach, say so and offer alternatives.
- **Preserve intent, add specificity**: The user's vision is correct. Your job is to add the technical specificity needed for clean execution, not to redirect.

## Important conventions

- Never add `Co-Authored-By` to commits
- CSS lives in `src/style.css` (map app) and `src/landing.css` (landing page)
- Three.js loaded via CDN in index.html (`unpkg.com/three@0.160.0`)
- MapLibre style: `public/style.json` (Protomaps basemap)
- Tile source: PMTiles served from Protomaps CDN
- Deployed on Vercel (auto-deploy from `main`)

## External APIs

- **Nominatim** (OpenStreetMap): Reverse/forward geocoding. Rate-limited, no API key needed.
- **Protomaps**: Vector tile CDN via PMTiles. API key in `public/style.json`.

## TypeScript

- `tsconfig.json` uses `noEmit: true` — tsc is type-check only, Vite handles bundling
- No `.js` files should exist in `src/` — they are build artifacts

## Agent swarm (.claude/agents/)

24 agents (all opus), 5 teams, flat Director architecture. Only the Director spawns agents. Team leads are senior reviewers, not delegators. Skills encode coordination patterns.

| Concept | Job | How It Works |
|---------|-----|--------------|
| **Agents** | WHO does the work | Isolated specialists, spawned by Director via Task |
| **Skills** | HOW work is coordinated | Playbooks that sequence agent invocations |
| **Hooks** | WHAT checks run | Automated quality gates (typecheck, build) |
| **Memory** | WHAT was learned | Per-team institutional knowledge |

```
Director (orchestrator, 4-phase cycle: Innovate > Think > Execute > Evaluate)
│
├── Writing Team
│   ├── copywriter        — LEAD (reviewer), tone/voice
│   ├── writer            — longform editorial, narrative prose
│   ├── philosopher       — intellectual depth, conceptual framing
│   └── researcher        — sources, fact-checking, academic references
│
├── Engineering Team
│   ├── technologist      — LEAD (reviewer), architecture decisions
│   ├── frontend-dev      — UI, CSS, DOM, animations, accessibility
│   ├── geo-frontend-dev  — MapLibre GL, map layers, projections
│   ├── geo-data-scientist — spatial data, GeoJSON, geocoding
│   ├── data-engineer     — pipelines, scaling, reusability
│   ├── qa-engineer       — tests, code review, refactoring
│   └── git-ops           — branches, commits, PRs, merges, cleanup
│
├── Design Team
│   ├── creative-director — LEAD (reviewer), art direction
│   ├── designer          — visual execution, typography, colour
│   ├── ux-researcher     — usability, accessibility, behaviour
│   ├── ui-researcher     — interface patterns, benchmarking
│   └── visual-qa         — Playwright screenshots, visual regression
│
├── Domain Team
│   ├── cartographer      — LEAD (reviewer), map accuracy
│   ├── architect         — built environment, urban form
│   ├── urbanist          — city systems, spatial justice
│   └── activist          — counter-cartography, critical review
│
└── Strategy
    ├── innovator         — fresh ideas, new project proposals
    ├── planner           — quality standards, task coordination, retrospectives
    └── ai-engineer       — prompt refinement, tool building, meta-cognition
```

### Skills (coordination playbooks)

11 skills in `.claude/skills/`:
- `/prompt-improver` — Enriches vague prompts: research → clarify → structured execution prompt
- `/analyse-workflows` — Foundry-inspired pattern analysis of workflow observation log
- `/writing-workflow` — Research → Frame → Write → Review
- `/engineering-workflow` — Assess → Implement → Test → Review
- `/design-workflow` — Research → Benchmark → Design → Review → QA
- `/domain-review` — Cartography → Architecture → Urban → Critical
- `/innovate-cycle` — Ideas → Research → Swarm improvements
- `/think-cycle` — Feasibility (parallel leads) → Framing → Structure → Planning
- `/evaluate-cycle` — Code QA → Visual QA → Retrospective → Meta-retro
- `/full-cycle` — Complete 4-phase orchestration
- `/git-workflow` — Branch → Implement → Commit → PR → Evaluate → Merge

### How to launch

**Single agent**: `Task(subagent_type: "cartographer", prompt: "...")`
**Full orchestration**: `Task(subagent_type: "director", prompt: "...")`
**Team lead for review**: `Task(subagent_type: "technologist", prompt: "...")` (reviews, does not delegate)

### Memory and documentation

```
.claude/
  docs/
    style-guide.md       — British English, no em dashes, voice rules
    roadmap.md           — current and planned work
    retrospectives.md    — learnings and process improvements
  memory/
    writing-team/        — sources, narrative decisions, voice
    engineering-team/    — architecture, tech debt, scaling
    design-team/         — design decisions, visual QA results
    domain-team/         — cartographic reviews, critical perspectives
    innovation/          — idea briefs, new project proposals
    ai-engineering/      — prompt versions, tool inventory, process improvements
    plans/               — session plans, quality reports
```
