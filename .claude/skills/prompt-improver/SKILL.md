---
name: prompt-improver
description: >
  Enriches vague prompts with targeted research and clarification before execution.
  Should be used when a prompt is determined to be vague and requires systematic
  research, question generation, and execution guidance.
user_invocable: true
---

# Prompt Improver

When invoked, this skill takes a vague or underspecified user prompt and transforms it into a detailed, actionable execution plan. It follows three phases.

## Phase 1: Research Context

Before asking questions, gather context silently:

1. **Read project state**: Check `git status`, recent commits, and the roadmap (`.claude/docs/roadmap.md`)
2. **Read relevant memory**: Scan team memory files in `.claude/memory/` for related decisions
3. **Read relevant code**: If the prompt mentions a feature area, read the module map in CLAUDE.md and the relevant source files
4. **Check existing work**: Search for any in-progress or recently completed work related to the prompt

Spend no more than 5 tool calls on research. The goal is to understand context, not to solve the problem.

## Phase 2: Generate Clarifying Questions

Based on the research, identify what's ambiguous or underspecified. Ask the user 1-4 targeted questions using `AskUserQuestion`. Questions should:

- Be specific, not generic ("Which ink palette preset should this use?" not "What style?")
- Offer concrete options informed by the codebase ("The ticker uses `requestAnimationFrame` at 60fps — should this new animation match that, or use CSS transitions instead?")
- Include a recommended option with rationale
- Cover: **scope** (what's in/out), **approach** (which pattern), **acceptance criteria** (how to verify)

If the prompt is actually clear after research, skip questions and proceed to Phase 3.

## Phase 3: Produce Execution Prompt

Synthesise the research and answers into a structured execution prompt:

```
## Task
[One sentence: what we're building/fixing/changing]

## Context
[2-3 sentences: why this matters, what exists today]

## Scope
- IN: [specific items]
- OUT: [explicit exclusions]

## Approach
[The chosen technical approach with rationale]

## Files to Modify
[List of files with what changes in each]

## Acceptance Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Build passes: `npm run build`]

## Alternatives Considered
[1-2 alternatives and why they were rejected]
```

Then ask the user: "This is the refined prompt. Should I proceed with execution, or adjust anything?"

## When NOT to Use This Skill

- The prompt is already specific and actionable
- The user explicitly says "just do it" or "no questions"
- The task is a simple fix (typo, single-line change)

## Anti-Patterns

- Do NOT ask more than 4 questions — that's interrogation, not clarification
- Do NOT research for more than 60 seconds — this is refinement, not exploration
- Do NOT rewrite the user's intent — preserve their vision, add specificity
- Do NOT add scope the user didn't ask for — clarify, don't expand
