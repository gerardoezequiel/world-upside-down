# Agent Performance Metrics

Track agent spawns, outcomes, and patterns to optimise the swarm over time.

## Tracking Format

After each session, the planner should log:

```
### [Date] Session: [Brief description]

| Agent | Spawned For | Outcome | Notes |
|-------|-------------|---------|-------|
| technologist | architecture review | ✅ success | - |
| frontend-dev | implement feature X | ✅ success | needed retry with clarification |
| visual-qa | screenshot check | ⚠️ partial | caught 2/3 issues |
| researcher | background on Y | ❌ failed | task too broad, escalated |
```

## Outcome Codes
- ✅ **success**: Task completed as specified
- ⚠️ **partial**: Task completed with gaps or required follow-up
- 🔄 **retry**: Required re-spawning with clarification
- ❌ **failed**: Could not complete, escalated or abandoned
- ⏭️ **skipped**: Determined unnecessary after spawn

## Metrics to Track

### Per Agent
- Spawn count (how often used)
- Success rate (✅ / total)
- Retry rate (🔄 / total)
- Average turns used vs maxTurns

### Per Workflow
- Which skills get invoked most
- Which phase tends to have issues
- Cross-team handoff friction points

### Swarm-Level
- Total agents spawned per session
- Parallel vs sequential spawn ratio
- Time from prompt to completion (subjective)

## Analysis Triggers

Review this file when:
- An agent has <50% success rate over 5+ spawns
- An agent hasn't been spawned in 10+ sessions (candidate for removal)
- A specific task type consistently fails (gap in agent coverage)

## Current Metrics

*No data yet. Start logging after next session.*

---

## Agent Utilisation Expectations

Based on project type (frontend-heavy cartographic art tool):

### High Utilisation (expect frequent spawns)
- frontend-dev, geo-frontend-dev (core implementation)
- designer, creative-director (visual aesthetic is central)
- cartographer (domain accuracy)
- technologist (architecture decisions)
- qa-engineer, git-ops (quality and workflow)

### Medium Utilisation
- writer, copywriter (story page content)
- ux-ui-researcher (usability, benchmarking)
- philosopher (conceptual framing for editorial)
- innovator, planner (session orchestration)

### Lower Utilisation (spawn as needed)
- data-engineer (no heavy data pipelines yet)
- geo-data-scientist (geocoding is built, may need for new features)
- researcher (specific research tasks)
- architect, urbanist, activist (domain review, not every session)
- visual-qa (after UI changes, not always)
- ai-engineer (meta-improvement, periodic)

If an agent in "High" rarely gets spawned, investigate. If an agent in "Lower" is constantly spawned, consider promoting or splitting.
