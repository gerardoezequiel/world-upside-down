# OpenClaw + Claude Code Cooperation

## Overview

OpenClaw is an open-source autonomous AI agent framework (149k+ GitHub stars, Feb 2026). It runs 24/7 as a personal assistant connected to messaging platforms. Claude Code is a CLI-based development tool. They complement each other.

| Dimension | OpenClaw | Claude Code |
|-----------|----------|-------------|
| Lifecycle | Always-on, event-driven | CLI-initiated, session-scoped |
| Strength | Messaging, monitoring, scheduling, web browsing | Code generation, refactoring, architecture, git |
| Agent model | Hub-and-spoke (Gateway + agents) | Flat Director + 23 specialists |
| Concurrency | Lane Queue (serial default, explicit parallel) | Sequential by default |
| Memory | Three-tier (SOUL/USER/IDENTITY + MEMORY.md + daily logs) | CLAUDE.md + per-team memory files |
| Skills format | SKILL.md with YAML (auto-injected, hot reload) | SKILL.md in .claude/skills/ (on-demand) |

## Division of Labour

- **OpenClaw**: Always-on tasks — message triage, calendar management, web monitoring, scheduled jobs, research via Semantic Snapshots
- **Claude Code**: Deep dev tasks — code generation, module extraction, refactoring, testing, git operations, architecture decisions

## MCP Bridges (Cooperation Layer)

### Claude Code calling OpenClaw
- **[openclaw-mcp-server](https://github.com/Helms-AI/openclaw-mcp-server)**: Exposes OpenClaw Gateway tools to Claude Code
- Use case: Claude Code delegates a research task or monitoring job to OpenClaw running on another machine

### OpenClaw calling Claude Code
- **[openclaw-claude-code-skill](https://github.com/Enderfga/openclaw-claude-code-skill)**: Wraps Claude Code as an MCP tool for OpenClaw
- Use case: OpenClaw detects a GitHub issue, spawns Claude Code to investigate and propose a fix

### Authentication bridge
- **[openclaw-mcp](https://github.com/freema/openclaw-mcp)**: Secure OAuth2 bridge between Claude.ai and self-hosted OpenClaw

## Shared Memory

No native sync protocol exists. Options:
1. **Git repository**: Both systems read/write to the same repo. OpenClaw can watch for changes.
2. **MCP-exposed memory**: OpenClaw exposes its memory tools via MCP; Claude Code reads/writes.
3. **Filesystem**: If on the same machine, shared `.claude/memory/` directory.

## Key OpenClaw Patterns Worth Adopting

### Already adopted
- **Depth-limited delegation**: Sub-agents cannot spawn sub-agents (both systems enforce this)
- **Memory seeding**: Per-team memory files with institutional knowledge
- **Quality hooks**: PostToolUse typecheck, Stop build verification

### Adopted in this session
- **Compaction memory flush** (PreCompact hook): Save learnings before context compaction
- **Session start context loading** (SessionStart hook): Read roadmap and recent git log
- **Task completion self-eval** (TaskCompleted hook): Lightweight post-task evaluation
- **Gentle prompt evaluation** (UserPromptSubmit hook): Non-blocking nudge instead of aggressive gate

### Future possibilities
- **Foundry-style self-improvement**: Auto-crystallise repeated patterns into dedicated tools (from [openclaw-foundry](https://github.com/lekt9/openclaw-foundry))
- **Semantic Snapshots**: Accessibility-tree parsing for web browsing agents (100x smaller than screenshots)
- **Agent Teams RFC**: Shared task lists, direct inter-agent messaging, dependency tracking (from [RFC #10036](https://github.com/openclaw/openclaw/discussions/10036))
- **Selective skill injection**: Only load relevant agent context per turn, not all 23

## Recursivity

Neither system supports recursive sub-agent nesting:
- **OpenClaw**: `isSubagentSessionKey()` guard blocks `sessions_spawn` from sub-agents. [Issue #11741](https://github.com/openclaw/openclaw/issues/11741) proposes configurable depth limits (2-3 levels).
- **Claude Code**: Subagents cannot use the Task tool. Single level of nesting only.
- **Our solution**: Flat Director architecture with Skills as coordination playbooks. The Director is the sole spawner.

## Skill Portability

Both use `SKILL.md` format but with differences:

| Feature | OpenClaw | Claude Code |
|---------|----------|-------------|
| Frontmatter | `bins`, `env`, `config` dependencies | `name`, `description`, `user_invocable` |
| Injection | Automatic per-turn (selective) | On-demand via `/skill-name` |
| Hot reload | Yes (filesystem watcher) | No |
| Marketplace | ClawHub (5,705+ skills) | None |

Skills cannot be directly shared but the MCP bridge lets one system invoke the other's capabilities.

## Cooperation Workflows

Three practical patterns for using OpenClaw and Claude Code together via the MCP bridge.

### Pattern A: Async Research Delegation

Fire-and-forget research while continuing to code. Use `openclaw_chat_async` to delegate, then check results later.

```
# Delegate research to OpenClaw (non-blocking)
openclaw_chat_async("Research the latest PMTiles spec changes and summarise breaking changes since v3")

# Continue coding...
# Later, check results:
openclaw_task_status(task_id)
```

**When to use**: Background research, competitive analysis, documentation gathering, monitoring tasks. Ideal during Phase 1 INNOVATE when the innovator or researcher needs broad web context.

### Pattern B: Knowledge Synthesis (Blocking)

When a decision depends on external knowledge, use `openclaw_chat` synchronously.

```
# Block until answer arrives
result = openclaw_chat("Compare WebSocket vs SSE for real-time map collaboration. Consider: latency, browser support, reconnection, and proxy compatibility.")

# Use result to inform architecture decision
```

**When to use**: Before architectural decisions, when evaluating external tools/APIs, when the team needs current information beyond the knowledge cutoff.

### Pattern C: Monitoring and Session Continuity

Use OpenClaw for long-running monitoring that outlives a Claude Code session.

```
# Set up monitoring (persists after CLI session ends)
openclaw_chat("Monitor the Protomaps status page. If any outage is reported, create a note in my Zotero library tagged 'infrastructure'.", session_id="map-monitoring")

# In a later session, check status:
openclaw_chat("What's the latest from the monitoring task?", session_id="map-monitoring")
```

**When to use**: CI/CD monitoring, dependency update tracking, issue triage on GitHub repos.

### Graceful Degradation

The OpenClaw gateway may be unreachable (offline, not configured, network issues). Always handle this:

1. Check `openclaw_status()` before relying on OpenClaw for critical-path work
2. If unreachable, fall back to Claude Code's own WebSearch/WebFetch tools
3. Never block a workflow on OpenClaw availability — treat it as an enhancement, not a dependency

### Tool Reference

| Tool | Blocking | Use Case |
|------|----------|----------|
| `openclaw_chat` | Yes | Decisions requiring external knowledge |
| `openclaw_chat_async` | No | Background research, monitoring setup |
| `openclaw_task_status` | Yes | Check async task results |
| `openclaw_task_list` | Yes | List all tasks, filter by status/session |
| `openclaw_task_cancel` | Yes | Cancel pending tasks |
| `openclaw_status` | Yes | Health check before delegation |

## References

- [OpenClaw Docs](https://docs.openclaw.ai/)
- [Agent Loop](https://docs.openclaw.ai/concepts/agent-loop)
- [Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [Sub-Agents](https://docs.openclaw.ai/tools/subagents)
- [Skills](https://docs.openclaw.ai/tools/skills)
- [Agent Teams RFC](https://github.com/openclaw/openclaw/discussions/10036)
- [NanoClaw](https://github.com/qwibitai/nanoclaw) — 500-line minimal alternative with container isolation
