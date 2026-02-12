---
name: think-cycle
description: >
  Phase 2 of the orchestration cycle. Assesses feasibility across all teams,
  frames the intellectual argument, and creates a task breakdown.
user-invocable: true
---

# Think Cycle

Use this workflow for the THINK phase of the orchestration cycle. This phase turns ideas into actionable plans.

## Before Starting

1. Read outputs from the INNOVATE phase (idea briefs, research notes)
2. Read `.claude/docs/roadmap.md` for current priorities
3. Read relevant team memory directories for context

## Workflow Steps

### Step 1: Feasibility Assessment (parallel)

Spawn the following team leads **in parallel** for independent assessments:

- **technologist**: technical feasibility, architecture implications, engineering effort
- **creative-director**: visual identity implications, design effort, riso aesthetic fit
- **cartographer**: cartographic accuracy, domain considerations, projection implications

Each lead returns: feasibility assessment with risks, effort estimate, and recommendations.

**Wait for all three assessments before proceeding.**

### Step 2: Conceptual Framing

Spawn the **philosopher** agent with:
- The idea brief(s) from INNOVATE
- All three feasibility assessments from Step 1
- Request: intellectual framing, connection to the project's thesis (orientation as choice, maps as critique)

Wait for conceptual framework.

### Step 3: Content and Interaction Structure

Spawn the **ux-researcher** agent with:
- The conceptual framework from Step 2
- Request: how should the user experience this? Content structure, interaction patterns, accessibility

Wait for UX recommendations.

### Step 4: Task Planning

Spawn the **planner** agent with:
- All feasibility assessments (Step 1)
- Conceptual framework (Step 2)
- UX recommendations (Step 3)
- Request: task breakdown with dependencies, agent assignments, quality criteria, estimated phases

Wait for actionable plan.

## Output

The Think Cycle produces:
- Feasibility assessments from three domains
- Intellectual framing connecting to project thesis
- UX/interaction structure
- Actionable task plan with dependencies and assignments

## After Completion

Update:
- `.claude/memory/plans/` with the session plan
- `.claude/docs/roadmap.md` if priorities change
