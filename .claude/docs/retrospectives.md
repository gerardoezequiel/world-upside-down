# Retrospectives and Learnings

Each work session should end with a brief retrospective. The Planner and Director maintain this document.

## Format
### [Date] Session Topic
- **What worked**: ...
- **What to improve**: ...
- **New ideas surfaced**: ...
- **Action items**: ...

---

### 2026-02-12 Swarm Evaluation and Fixes
- **What worked**: Systematic evaluation caught the workflow logger bug (empty tool/session fields), bloated permissions (107 entries with one-off commands), and correctly assessed memory directories as having good structure but needing enrichment.
- **What to improve**: Initial assessment said memory was "empty stubs" but they actually had reasonable content; should read files before judging. The `$(cat)` + jq approach for PostToolUse hooks times out on large Edit/Write payloads; bounded reads (`head -c 500`) + grep are more robust than full JSON parsing.
- **New ideas surfaced**: Consider `sonnet` model for research-only agents to reduce cost. SubagentStop hook could be conditional based on agent complexity.
- **Action items**: Fixed workflow logger (external script with bounded read), cleaned settings.local.json (107 to 60 entries), updated all 7 memory directories, added retrospective entries.

---

### 2026-02-12 Agent Swarm Architecture
- **What worked**: Systematic audit of all 23 agents caught the subagent nesting limitation early. Deep research on Claude Code best practices (Slavka Memory Pattern, single-objective prompts, canonical orchestration patterns) gave evidence-based improvements.
- **What to improve**: Memory directories were created empty during initial swarm setup; should seed immediately. Roadmap was left as a stub; should populate as part of any architectural work. Team leads had Task() delegation that could never work; should validate tool capabilities against Claude Code constraints before assigning.
- **New ideas surfaced**: Image generation integration (fal.ai, Ideogram), Evaluator/Sentinel pattern for quality gates, fix-and-commit automation loops.
- **Action items**: Seed all memory READMEs (done), create think-cycle skill (done), add quality hooks, sharpen all agent prompts with Deliverable sections.
