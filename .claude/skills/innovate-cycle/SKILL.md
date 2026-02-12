---
name: innovate-cycle
description: >
  Phase 1 of the orchestration cycle. Generates new ideas, researches
  possibilities, and proposes swarm improvements.
user-invocable: true
---

# Innovate Cycle

Use this workflow for the INNOVATE phase of the orchestration cycle.

## Before Starting

1. Read `.claude/docs/roadmap.md` for current priorities
2. Read `.claude/memory/innovation/` for previous ideas and proposals
3. Read `.claude/memory/ai-engineering/` for recent process insights

## Workflow Steps

### Step 1: Idea Generation
Spawn the **innovator** agent with:
- Current project state and recent work
- Request: fresh ideas, new features, lateral connections, new project proposals

Wait for idea briefs.

### Step 2: Background Research
Spawn the **researcher** agent with:
- The most promising ideas from Step 1
- Request: feasibility evidence, prior art, technical requirements

Wait for research briefs.

### Step 3: Swarm Improvement (optional)
Spawn the **ai-engineer** agent with:
- Recent session outcomes and retrospectives
- Request: prompt refinement proposals, tool building suggestions, process improvements

Wait for improvement proposals.

## After Completion

Update:
- `.claude/memory/innovation/` with idea briefs
- `.claude/docs/roadmap.md` with accepted ideas
