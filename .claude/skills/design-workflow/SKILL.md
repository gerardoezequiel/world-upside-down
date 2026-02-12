---
name: design-workflow
description: >
  Coordinates the design team for visual design work. Follow this playbook
  to produce design output by spawning agents in the correct sequence.
user-invocable: true
---

# Design Workflow

Use this workflow when designing new features, refining visual identity, or auditing existing designs.

## Before Starting

1. Read `.claude/memory/design-team/` for previous design decisions
2. Understand the design identity: Swiss editorial + risograph printing
3. Define the design brief: what needs designing, constraints, context

## Workflow Steps

### Step 1: User Research
Spawn the **ux-researcher** agent with:
- The feature or design context
- Request: user needs analysis, accessibility requirements, interaction patterns

Wait for UX brief.

### Step 2: Pattern Benchmarking
Spawn the **ui-researcher** agent with:
- The feature type (map tool, overlay, panel, etc.)
- Request: best-in-class pattern analysis, responsive strategy

Wait for UI patterns report.

### Step 3: Visual Execution
Spawn the **designer** agent with:
- The UX brief from Step 1
- The UI patterns from Step 2
- Request: visual specs, layout, typography, colour application

Wait for design specs.

### Step 4: Art Direction Review
Spawn the **creative-director** agent with:
- The design specs from Step 3
- Request: review for visual identity coherence, riso aesthetic, brand alignment

Wait for art direction feedback. If changes needed, re-spawn designer.

### Step 5: Visual QA
Spawn the **visual-qa** agent with:
- The implemented design (or design specs)
- Request: screenshot testing, responsive verification, visual regression check

## After Completion

Update `.claude/memory/design-team/` with:
- Design decisions made
- Visual QA results
- Pattern references
