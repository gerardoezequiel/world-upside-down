# Plans and Quality Memory

## Session Format
Each work session should follow:
1. Read roadmap and relevant team memory
2. Define scope and success criteria
3. Execute work (invoke appropriate workflow skill)
4. Run evaluate-cycle
5. Update memory and docs

## Quality Criteria
- Code: `npm run build` passes, no type errors, named exports only
- Content: British English, no em dashes, substantive claims with evidence
- Design: matches riso identity, responsive, accessible
- Maps: scale bar correct, projections labelled, orientation intentional

## Session Log
| Date | Scope | Workflow Used | Outcome | Retrospective |
|------|-------|---------------|---------|---------------|
| 2026-02-12 | Swarm restructuring | Manual | Skills + flat Director architecture | See retrospectives.md |
| 2026-02-12 | Swarm evaluation + fixes | Manual | Fixed logger, cleaned settings, populated memory | See retrospectives.md |

## Retrospective Patterns (add recurring insights)
- Workflow logger hooks need bounded stdin reads; full `$(cat)` blocks on large Edit/Write payloads
- settings.local.json accumulates one-off entries quickly; periodic cleanup needed
- Memory directories should be populated with real decisions immediately, not left as stubs

## Active Priorities
- See `.claude/docs/roadmap.md` for current work
