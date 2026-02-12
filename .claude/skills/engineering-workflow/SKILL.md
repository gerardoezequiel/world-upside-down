---
name: engineering-workflow
description: >
  Coordinates the engineering team for feature development. Follow this playbook
  to build features by spawning agents in the correct sequence.
user-invocable: true
---

# Engineering Workflow

Use this workflow when building features, fixing bugs, or refactoring code.

## Before Starting

1. Read `.claude/memory/engineering-team/` for architecture decisions and tech debt
2. Identify scope: what needs building, reviewing, testing
3. Check `npm run build` passes before starting

## Workflow Steps

### Step 1: Architecture Assessment
Spawn the **technologist** agent with:
- The feature/bug description
- Request: feasibility assessment, architecture recommendation, which specialists are needed

Wait for architecture plan.

### Step 2: Implementation
Based on technologist's recommendation, spawn the appropriate dev agent(s):

- **frontend-dev** for UI, CSS, DOM, animations, accessibility
- **geo-frontend-dev** for MapLibre, map layers, projections, tiles
- **geo-data-scientist** for spatial data, geocoding, coordinate transforms
- **data-engineer** for pipelines, scaling, data architecture

Provide each agent with:
- The architecture plan from Step 1
- Specific implementation instructions
- Relevant file paths

Can spawn multiple dev agents in parallel if their work is independent.

### Step 3: Quality Assurance
Spawn the **qa-engineer** agent with:
- All code changes from Step 2
- Request: code review, tests, refactoring suggestions

Wait for quality report.

### Step 4: Visual Verification (if UI changes)
If the changes affect the UI, spawn the **visual-qa** agent with:
- Description of what changed visually
- Request: screenshot comparison, responsive check, regression testing

### Step 5: Build Verification
Run `npm run build` to verify TypeScript compiles and Vite bundles correctly.

## After Completion

Update `.claude/memory/engineering-team/` with:
- Architecture decisions made
- Tech debt identified
- Reusability notes
