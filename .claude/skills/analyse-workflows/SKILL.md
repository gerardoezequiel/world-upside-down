---
name: analyse-workflows
description: >
  Foundry-inspired workflow pattern analysis. Reads the workflow observation log,
  identifies repeated tool-use patterns, and proposes crystallisation into
  dedicated Skills. Run periodically by the ai-engineer agent.
user_invocable: true
---

# Analyse Workflows

Inspired by OpenClaw's Foundry extension. Reads the workflow observation log and identifies patterns that should be crystallised into dedicated Skills.

## Prerequisites

- Workflow log must have 50+ entries: `.claude/memory/ai-engineering/workflow-log.jsonl`
- If the log has fewer entries, report "Not enough data yet" and exit

## Phase 1: Read and Parse

1. Read `.claude/memory/ai-engineering/workflow-log.jsonl`
2. Parse each JSONL line: `{ ts, tool, session }`
3. Group by session to reconstruct tool-use sequences
4. Count frequency of each unique sequence pattern

## Phase 2: Identify Patterns

Look for sequences that appear 5+ times:
- Same tool chain (e.g., Grep → Read → Edit → Read) repeated across sessions
- Similar goals inferred from file paths and tool inputs
- High success rate (no immediate follow-up corrections)

## Phase 3: Propose Crystallisation

For each identified pattern, propose:
- **Skill name**: Descriptive slug (e.g., `fix-typescript-error`)
- **Trigger**: What kind of user request activates this pattern
- **Tool sequence**: The observed chain of tools
- **Estimated savings**: How many tool calls this would reduce

Present proposals to the user via `AskUserQuestion`.

## Phase 4: Generate (if approved)

1. Create `.claude/skills/<name>/SKILL.md` with the crystallised workflow
2. Update CLAUDE.md skills count
3. Log the crystallisation in `.claude/memory/ai-engineering/README.md`

## Anti-Patterns

- Do NOT propose skills for one-off workflows
- Do NOT crystallise patterns with <70% success rate
- Do NOT create overly specific skills (they should generalise)
- Do NOT auto-deploy without user approval
