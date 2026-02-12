---
name: full-cycle
description: >
  Complete four-phase orchestration cycle: Innovate, Think, Execute, Evaluate.
  Use for major feature development or content production.
user-invocable: true
---

# Full Orchestration Cycle

Use this workflow for complex work that benefits from the complete four-phase cycle.

## Phase 1: INNOVATE

Invoke the `/innovate-cycle` workflow to:
- Generate fresh ideas from the current project state
- Research promising directions
- Identify swarm improvements

Output: idea briefs, research notes, improvement proposals.

## Phase 2: THINK

Invoke the `/think-cycle` workflow to:
- Assess feasibility across all team leads (in parallel)
- Frame the intellectual argument
- Design content/interaction structure
- Create actionable task breakdown

Output: feasibility assessments, conceptual framework, actionable plan.

## Phase 3: EXECUTE

Based on the plan from Phase 2, invoke the appropriate workflow skills:

- For content work: invoke `/writing-workflow`
- For feature development: invoke `/engineering-workflow`
- For visual design: invoke `/design-workflow`

Spawn implementation agents in parallel where their work is independent.

### Cross-Team Touchpoints
- Content + Design: writer output goes to designer for layout
- Engineering + Design: frontend-dev output goes to visual-qa
- Domain + Content: activist reviews writer's geographic framing

Output: implemented features, written content, visual assets.

## Phase 4: EVALUATE

Invoke the `/evaluate-cycle` workflow to:
- Review code quality
- Run visual QA
- Perform domain review
- Run retrospective
- Trigger meta-retrospective

Output: quality report, retrospective, updated docs and memory.

## After Completion

Ensure all memory directories are updated:
- `.claude/memory/writing-team/`
- `.claude/memory/engineering-team/`
- `.claude/memory/design-team/`
- `.claude/memory/domain-team/`
- `.claude/memory/innovation/`
- `.claude/memory/ai-engineering/`
- `.claude/memory/plans/`
- `.claude/docs/roadmap.md`
- `.claude/docs/retrospectives.md`
