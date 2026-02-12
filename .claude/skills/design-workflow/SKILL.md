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

### Step 1: UX/UI Research
Spawn the **ux-ui-researcher** agent with:
- The feature or design context
- Request: user needs analysis, accessibility requirements, interaction patterns, AND best-in-class pattern analysis, responsive strategy

This consolidated agent handles both behavioural research and interface benchmarking. Wait for combined UX/UI brief.

### Step 2: Visual Execution
Spawn the **designer** agent with:
- The UX/UI brief from Step 1
- Request: visual specs, layout, typography, colour application

Wait for design specs.

### Step 3: Art Direction Review
Spawn the **creative-director** agent with:
- The design specs from Step 2
- Request: review for visual identity coherence, riso aesthetic, brand alignment

Wait for art direction feedback. If changes needed, re-spawn designer.

### Step 4: Visual QA (after implementation)
Spawn the **visual-qa** agent with:
- The implemented design
- Request: screenshot testing, responsive verification, visual regression check

Note: Step 4 runs after engineering has implemented the design, not during the design phase.

## After Completion

Update `.claude/memory/design-team/` with:
- Design decisions made
- Visual QA results
- Pattern references
