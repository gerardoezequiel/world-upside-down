---
name: domain-review
description: >
  Coordinates the domain team for cartographic and critical review. Follow this
  playbook to review map-related work for accuracy and ethical framing.
user-invocable: true
---

# Domain Review

Use this workflow when reviewing map features, geographic content, or anything touching spatial representation.

## Before Starting

1. Read `.claude/memory/domain-team/` for previous reviews and perspectives
2. Identify what needs review: map accuracy, cultural sensitivity, political framing, spatial form

## Workflow Steps

### Step 1: Cartographic Review
Spawn the **cartographer** agent with:
- The map feature or content to review
- Request: accuracy check (projections, scale, symbology, labels)

Wait for cartographic assessment.

### Step 2: Domain-Specific Review (as needed)

If the work involves **built environment** (buildings, landmarks, public space):
Spawn the **architect** agent with the relevant content.

If the work involves **city systems** (mobility, neighbourhood dynamics, policy):
Spawn the **urbanist** agent with the relevant content.

### Step 3: Critical Review
Spawn the **activist** agent with:
- All content and previous review feedback
- Request: decolonial review, power analysis, language sensitivity check

Wait for critical assessment.

## After Completion

Update `.claude/memory/domain-team/` with:
- Review findings
- Critical perspectives raised
- Corrections made
