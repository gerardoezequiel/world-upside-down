# AI Engineering Memory

## Prompt Changelog
| Date | Agent | Change | Rationale | Outcome |
|------|-------|--------|-----------|---------|
| 2026-02-12 | all 4 leads | Removed Task() delegation | Subagents can't spawn subagents | Fixed broken architecture |
| 2026-02-12 | all 21 agents | Added MCP tools (Context7, ide, Zotero, pencil, memory, etc.) | Gap analysis showed missing tools | Full tool coverage |
| 2026-02-12 | all 23 agents | Added Deliverable section | Single-objective pattern from research | Pending evaluation |
| 2026-02-12 | system | Fixed workflow logger hook | `$(cat)` + jq timed out on large Edit/Write stdin | Now uses bounded `head -c 500` + grep |
| 2026-02-12 | system | Cleaned settings.local.json | 107 entries → 60; removed one-off command approvals | Reduced noise, kept broad patterns |
| 2026-02-12 | 5 agents | Tiered model: activist, architect, urbanist, ui-researcher, ux-researcher → sonnet | Pure-review agents don't need opus reasoning | Cost reduction, no capability loss |
| 2026-02-12 | system | Smarter SubagentStop hook | Blanket reminder was noisy; conditional prompt with team directory mapping | Less noise, targeted suggestions |
| 2026-02-12 | director | Added OpenClaw external delegation section + Phase 1 note + rule #9 | Director needs awareness of MCP bridge for async research | Enables cross-system cooperation |
| 2026-02-12 | docs | Added Cooperation Workflows to openclaw-integration.md | 3 practical patterns (async, blocking, monitoring) + graceful degradation | Actionable reference for bridge usage |
| 2026-02-12 | git-ops | Created git-ops agent + /git-workflow skill | No git discipline in swarm; all work went straight to main | GitHub Flow: branches, PRs, squash merge |

## Tool Inventory
- 11 Skills in `.claude/skills/`
- 24 agent definitions in `.claude/agents/`
- Quality hooks in `.claude/settings.local.json`
- Hook scripts in `.claude/hooks/` (log-tool-use.sh)
- Memory directories: 7 teams + project-level

## Process Improvement Log
| Date | Proposal | Status | Result |
|------|----------|--------|--------|
| 2026-02-12 | Restructure to flat Director + Skills | Accepted | All agents now flat under Director |
| 2026-02-12 | Seed empty memory directories | Accepted | READMEs created with Slavka pattern |
| 2026-02-12 | Add think-cycle skill | Accepted | Completes 4-phase skill set |
| 2026-02-12 | Fix workflow logger (bounded stdin) | Accepted | External script: `.claude/hooks/log-tool-use.sh` |
| 2026-02-12 | Clean settings.local.json | Accepted | 107 → 60 allow entries |
| 2026-02-12 | Tiered model assignment (5 review agents → sonnet) | Accepted | activist, architect, urbanist, ui-researcher, ux-researcher |
| 2026-02-12 | Conditional SubagentStop hook | Accepted | Team-directory-aware, skips trivial outputs |
| 2026-02-12 | OpenClaw cooperation workflows in docs + director | Accepted | 3 patterns + graceful degradation documented |
| 2026-02-12 | Add git-ops agent + /git-workflow skill | Accepted | GitHub Flow: 24 agents, 12 skills |

## Image Generation Config
- Primary: fal.ai FLUX.2 Pro ($0.03/image, ~3s)
- Text-heavy: Ideogram v3 ($0.025-0.04/image)
- Prototyping: Together AI FLUX Schnell (FREE)
- Premium: Google Nano Banana Pro ($0.02-0.134/image)
- No API keys configured yet — needs setup

## Key Insights
- Subagents CANNOT spawn other subagents (hard Claude Code limitation — same in OpenClaw)
- Skills run inline in parent context (good for coordination playbooks)
- Memory should follow Slavka pattern: short pointers, not context dumps
- Agents perform best with single-objective per invocation
- 3-5 simultaneously active agents is the sweet spot per workflow phase
- UserPromptSubmit hooks must NEVER block — use gentle nudge pattern (inject additionalContext, let main model decide)
- OpenClaw's "Default Serial, Explicit Parallel" philosophy applies to our swarm too
- PreCompact hooks can save session learnings before context compaction (mirrors OpenClaw's compaction memory flush)

- Pure-review agents (no Edit/Write/Bash) perform well on sonnet — opus is overkill for text-only analysis
- SubagentStop hooks should be conditional: only suggest memory updates for decisions/patterns/learnings, not trivial lookups
- OpenClaw bridge is an enhancement, never a dependency — always have a WebSearch/WebFetch fallback

## OpenClaw Research (2026-02-12)
- Full research documented in `.claude/docs/openclaw-integration.md`
- Key patterns adopted: compaction flush, session start context, task self-eval, gentle prompt hook
- Future patterns to explore: Foundry self-improvement, Semantic Snapshots, Agent Teams RFC
- MCP bridges exist for bidirectional cooperation (openclaw-mcp-server, openclaw-claude-code-skill)

## Hook Architecture
- Model tiers: 5 sonnet (pure-review), 18 opus (code-producing + leads + reasoning)
- 11 skills (8 workflow + prompt-improver + analyse-workflows + git-workflow)
- 8 hooks: PostToolUse (typecheck + workflow observation), Stop (build), SubagentStop (memory reminder), UserPromptSubmit (gentle eval), PreCompact (memory flush), SessionStart (context load), TaskCompleted (self-eval)

## Foundry-Inspired Self-Improvement
- Observation: PostToolUse hook logs Edit/Write/Bash/Task calls to `workflow-log.jsonl` via `.claude/hooks/log-tool-use.sh`
- Analysis: `/analyse-workflows` skill reads log, identifies patterns (5+ uses, 70%+ success)
- Crystallisation: Proposes new Skills from detected patterns (user approval required)
- Phase 1 active (observation). Phase 2 at 50+ log entries. Phase 3 future.
- Architecture documented in `.claude/docs/openclaw-integration.md`

## OpenClaw MCP Bridge
- Installed: `openclaw-mcp-server` (Helms-AI) at `~/.claude/openclaw-mcp-server/`
- Registered with Claude Code via `claude mcp add openclaw`
- Status: awaiting remote Gateway URL configuration from user
- Docs: `.claude/docs/openclaw-integration.md`
