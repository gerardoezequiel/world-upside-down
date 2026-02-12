---
name: writing-workflow
description: >
  Coordinates the writing team for content production. Follow this playbook
  to produce editorial content by spawning agents in the correct sequence.
user-invocable: true
---

# Writing Workflow

Use this workflow when producing editorial content (articles, story pages, captions, extended prose).

## Before Starting

1. Read `.claude/docs/style-guide.md` for voice and language rules
2. Read `.claude/memory/writing-team/` for previous decisions and sources
3. Define the content brief: topic, audience, length, tone

## Workflow Steps

### Step 1: Research
Spawn the **researcher** agent with:
- The topic and angle
- What kind of sources are needed (academic, primary, journalistic)
- Any specific claims that need verification

Wait for sources and research brief.

### Step 2: Conceptual Framing
Spawn the **philosopher** agent with:
- The research brief from Step 1
- The core question or argument to frame
- Request: intellectual scaffolding, not finished prose

Wait for conceptual framework.

### Step 3: Narrative Composition
Spawn the **writer** agent with:
- The research brief (sources, facts, references)
- The conceptual framework (argument structure, key ideas)
- The content brief (length, format, medium)

Wait for draft prose.

### Step 4: Voice Review
Spawn the **copywriter** agent with:
- The draft prose from Step 3
- Request: review for tone, voice consistency, brevity, British English, no em dashes

Wait for polished output.

### Step 5: Critical Review (if applicable)
If the content touches geography, power, colonialism, or representation:
Spawn the **activist** agent with:
- The polished text
- Request: critical review for decolonial sensitivity, substantive claims, ethical framing

## After Completion

Update `.claude/memory/writing-team/` with:
- Sources used
- Narrative decisions made
- Content structure rationale
