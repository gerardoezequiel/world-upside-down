---
name: evaluate-cycle
description: >
  Phase 4 of the orchestration cycle. Reviews quality, runs tests, performs
  visual QA, and triggers retrospectives.
user-invocable: true
---

# Evaluate Cycle

Use this workflow for the EVALUATE phase of the orchestration cycle.

## Before Starting

1. Identify all work completed in the current session
2. Read `.claude/memory/plans/` for the session plan and quality criteria

## Workflow Steps

### Step 1: Code Quality
Spawn the **qa-engineer** agent with:
- All code changes from the session
- Request: code review, run tests, check for regressions, verify build

Wait for quality report.

### Step 2: Visual Quality
Spawn the **visual-qa** agent with:
- All UI changes from the session
- Request: screenshot testing, responsive verification, visual regression check

Wait for visual QA report.

### Step 3: Domain Review (if map-related changes)
If the session included map features or geographic content, invoke the `/domain-review` workflow.

### Step 4: Quality Review and Retrospective
Spawn the **planner** agent with:
- All review reports from Steps 1-3
- Request: quality assessment, retrospective, documentation updates

Wait for retrospective.

### Step 5: Meta-Retrospective
Spawn the **ai-engineer** agent with:
- The retrospective from Step 4
- All session outcomes
- Request: swarm performance analysis, prompt improvement proposals, process suggestions

## After Completion

Update:
- `.claude/memory/plans/` with quality report
- `.claude/docs/retrospectives.md` with session learnings
- `.claude/memory/ai-engineering/` with meta-insights
