# Director Agent Memory

## Team Roster (active memory as of 2026-02-13)
Agents with populated memory:
- writer, copywriter, geo-data-scientist, ux-researcher, innovator, cartographer

Agents with empty memory (seed on first use):
- technologist, frontend-dev, geo-frontend-dev, data-engineer, qa-engineer
- creative-director, designer, visual-qa, ui-researcher
- architect, urbanist, activist, philosopher, researcher
- planner, ai-engineer

## Coordination Notes
- Memory lives at `.claude/agent-memory/{agent-name}/MEMORY.md`
- Each agent owns its own directory; can create topic files alongside MEMORY.md
- No shared cross-team memory exists yet — agents are knowledge islands

## Observed Failure Modes
- **Research perfectionism**: Agents (esp. cartographer) spend all budget reading/searching, never produce the deliverable. Mitigation: timebox research in prompts, write incrementally.
- **Silent hook failures**: Missing files referenced by hooks cause silent failures nobody notices. Always verify hook targets exist.

## Process
- Roadmap: `.claude/docs/roadmap.md`
- Tool use logs: `.claude/logs/tool-use.jsonl`
