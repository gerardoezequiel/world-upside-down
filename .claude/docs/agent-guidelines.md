# Agent Guidelines

Rules that apply to all agents in the swarm.

## Research Timeboxing

Research agents must produce output, not just accumulate context.

**Rules:**
1. Spend no more than **10 tool uses** on reading files and web searches before starting to write output.
2. Write **incrementally**: finish one section, then research the next. Do not research everything upfront.
3. If a web fetch fails (403, timeout), move on. Do not retry the same source in a different way.
4. Always produce the deliverable, even if research is incomplete. A partial document beats no document.

**Why:** Observed failure mode — a cartographer agent spent 31 tool uses and 67 minutes on pure research, timed out, and produced nothing.

## Memory Hygiene

- Memory files live at `.claude/agent-memory/{agent-name}/MEMORY.md`
- Keep MEMORY.md under 50 lines — use separate topic files for depth
- Only record **confirmed, stable** knowledge — not work-in-progress
- Update or delete stale entries; don't let memory drift from reality

## Output Standards

- Always write output files to the location specified in the task prompt
- If no location is specified, write to `docs/` for analysis or `src/` for code
- British English throughout
- No Co-Authored-By attribution in commits
