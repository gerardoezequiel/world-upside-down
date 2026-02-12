# Deep Research: Improving the Claude Code Agent Swarm

## Current System Baseline
- 23 agents across 5 teams (Writing, Engineering, Design, Domain, Strategy)
- 7 workflow Skills as coordination playbooks
- A Director as the single orchestrator (only entity that spawns agents)
- Memory directories for each team
- Argument mapping framework for critical thinking

---

# 1. CLAUDE CODE AGENT BEST PRACTICES (2025-2026)

## Key Findings

### A. Agent Count and Specialization
The community consensus is converging on a critical insight: **fewer, sharper agents beat many diffuse ones**. The recommendation from multiple sources is to max out at 3-4 specialized agents per active context, not 23.

> "More than [3-4 specialized agents] decreases productivity rather than increasing it."
> -- [How I use Claude Code (+ my best tips)](https://www.builder.io/blog/claude-code)

**However**, this applies to *simultaneously active* agents, not total agent *definitions*. Your 23 agents across 5 teams may be fine if only a handful are active in any given workflow. The issue is whether the Director is spawning too many at once.

### B. Skills as the Primary Extension Mechanism
Anthropic has unified slash commands into the Skills system (Claude Code 2.1+). Skills are now the canonical way to give agents reusable capabilities.

Key configuration from [Anthropic's official skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):
- **SKILL.md body under 500 lines** for optimal performance
- **Frontmatter controls**: `disable-model-invocation: true` for side-effect skills, `user-invocable: false` for background knowledge
- **Hot-reloading** in Claude Code 2.1: saving SKILL.md immediately updates the running session
- **Context budget**: Skills share a 2% of context window budget (~16k chars fallback). Too many skills can exceed this.

### C. The Slavka Memory Pattern
A breakthrough pattern for scaling agent knowledge without context bloat, documented in [Claude Code issue #24718](https://github.com/anthropics/claude-code/issues/24718):

```
CLAUDE.md = RAM        (always loaded, keep under ~200 lines)
_guides/  = SSD        (fast access when needed, unlimited capacity)
Explore   = Internet   (slow, expensive, avoid when possible)
```

**Before vs. After**: Context used for "memory" drops from ~150k tokens to ~7k tokens. Available knowledge goes from limited to unlimited. Explore agents per session drop from 2-3 to 0.

### D. Official Anthropic Recommendations
From [Claude Code: Best practices for agentic coding](https://code.claude.com/docs):
- Start with planning mode before coding
- Use aggressive `/clear` between task phases
- Break large tasks into context-sized chunks
- Avoid the last 20% of context window for multi-file work
- Document project structure once in CLAUDE.md, replacing expensive Explore agents

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Reduce simultaneously active agents to 3-5 per workflow** -- the Director should only spawn what's needed for the current phase, not the full team | CRITICAL |
| 2 | **Adopt the Slavka Memory Pattern** -- restructure team memory directories as read-on-demand guides referenced by pointers in CLAUDE.md | CRITICAL |
| 3 | **Keep each SKILL.md under 500 lines** -- audit all 7 workflow Skills and split oversized ones into separate reference files | IMPORTANT |
| 4 | **Add `disable-model-invocation: true`** to workflow Skills with side effects (deploy, publish, commit) | IMPORTANT |
| 5 | **Use `user-invocable: false`** for background knowledge Skills the Director auto-discovers | NICE-TO-HAVE |

---

# 2. AGENT PROMPT ENGINEERING

## Key Findings

### A. Structure Over Content (Meta-Prompting)
[Meta Prompting research](https://www.promptingguide.ai/techniques/meta-prompting) shows that focusing on structural and syntactical patterns outperforms content-heavy prompts:
- Token-efficient: reduces prompt size by focusing on structure
- More generalizable: structural prompts adapt to varied inputs
- Fairer evaluation: minimizes influence of specific examples

### B. Task Decomposition is Non-Negotiable
From [Anthropic's prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices):
> "A focused task with clear boundaries consistently produces higher quality results than trying to accomplish multiple objectives in a single prompt."

This directly impacts your swarm: each agent should have a single, sharply-defined objective per invocation.

### C. The 3-Agent Meta-Prompt Architecture
An emerging pattern from [LLM Workflows](https://www.hypeflo.ws/workflow/agentic-meta-prompt-for-claude-code-3-agent-system-generator):
1. **Orchestrator (Atlas)**: Coordinates everything
2. **Specialist (Mercury)**: Does the actual work in parallel
3. **Evaluator (Apollo)**: Grades outputs and demands specific improvements

This maps well to your Director + Team Agent + Quality Check flow.

### D. Automated Prompt Optimization
[DSPy](https://arize.com/blog/prompt-optimization-few-shot-prompting/) (Stanford) provides automated prompt optimization through MIPRO v2, which breaks complex instructions into sub-prompts and optimizes them individually. [Evidently AI](https://www.evidentlyai.com/blog/automated-prompt-optimization) offers open-source automated prompt optimization tools.

### E. Claude-Specific Prompt Techniques
From [Anthropic's prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview):
- Frontier thinking LLMs follow ~150-200 instructions with reasonable consistency
- Smaller/non-thinking models handle fewer instructions
- Be explicit about output format, constraints, and stop conditions

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Restructure agent prompts to single-objective format** -- each agent invocation gets ONE clear deliverable, not a list of responsibilities | CRITICAL |
| 2 | **Add an Evaluator role** to each team -- a lightweight critic agent that grades output before the Director accepts it | CRITICAL |
| 3 | **Cap agent instructions at 150 items** -- audit all agent system prompts and trim to the structural essentials | IMPORTANT |
| 4 | **Implement meta-prompting for agent improvement** -- use Claude itself to analyze and optimize agent prompts periodically | IMPORTANT |
| 5 | **Add few-shot examples to critical agent prompts** -- especially for Writing and Design agents where output quality is subjective | NICE-TO-HAVE |

---

# 3. MULTI-AGENT COORDINATION PATTERNS

## Key Findings

### A. Six Canonical Orchestration Patterns
From the [Claude Code Swarm Orchestration Skill](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea):

1. **Parallel Specialists (Leader Pattern)**: Multiple reviewers work simultaneously. Best for comprehensive reviews where different expertise domains contribute independently.
2. **Pipeline (Sequential Dependencies)**: Tasks unblock automatically as predecessors complete. Best for ordered workflows like research -> plan -> implement -> test -> review.
3. **Swarm (Self-Organizing)**: Independent workers claim available tasks from a pool. Natural load-balancing without central coordination.
4. **Research + Implementation**: Synchronous research first, then implementation with findings embedded.
5. **Plan Approval Workflow**: Architect creates plan, leader reviews before proceeding. Ensures alignment before investment.
6. **Coordinated Multi-File Refactoring**: Multiple workers handle different files with convergent dependencies.

### B. The Context Degradation Problem
From [Addy Osmani's analysis](https://addyosmani.com/blog/claude-code-agent-teams/):
> "The core insight behind swarms is that LLMs perform worse as context expands -- the more information in the context window, the harder it is for the model to focus on what matters right now."

Each agent getting its own clean context window is the primary benefit, not parallelism.

### C. TeammateTool Operations
Claude Code's built-in [TeammateTool](https://code.claude.com/docs/en/agent-teams) provides 13 operations across team management, communication, and lifecycle. Key communication insight: **"Your text output is NOT visible to the team. You MUST use Teammate `write` to communicate findings."** Use targeted `write` calls instead of expensive `broadcast`.

### D. Task Dependency System
The built-in task system supports three states (pending, in-progress, completed), dependency tracking (tasks auto-unblock when dependencies complete), self-claiming (teammates self-assign next available tasks), and file locking to prevent race conditions.

### E. The Blackboard Architecture
From [research on multi-agent coordination](https://arxiv.org/html/2507.01701v1):
- A shared semantic blackboard allows all agents to read, write, and coordinate based on evolving task state
- No task assignment needed -- requests are broadcast on the blackboard, agents self-select
- Reduces complexity and improves scalability vs. centralized orchestration

### F. Delegate Mode
From [Claude Code docs](https://code.claude.com/docs/en/agent-teams): **Delegate mode** (Shift+Tab) restricts the lead to coordination-only tools, preventing implementation creep. This is the "Director stays Director" enforcement mechanism.

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Map each of the 7 workflow Skills to one of the 6 canonical patterns** -- Pipeline for sequential workflows, Parallel Specialists for reviews, Swarm for independent tasks | CRITICAL |
| 2 | **Implement a shared blackboard (memory/blackboard.md)** -- all agents write findings to a shared file the Director monitors, replacing broadcast messages | CRITICAL |
| 3 | **Use task dependencies extensively** -- every workflow should define which tasks block which, enabling automatic unblocking | IMPORTANT |
| 4 | **Enforce Delegate Mode for the Director** -- the Director should NEVER implement, only coordinate | IMPORTANT |
| 5 | **Assign file ownership boundaries** -- each agent owns specific files, preventing merge conflicts and overwrites | IMPORTANT |
| 6 | **Add graceful shutdown protocol** -- agents should request shutdown, wait for approval, and cleanup | NICE-TO-HAVE |

---

# 4. MEMORY AND CONTEXT MANAGEMENT

## Key Findings

### A. Memory Taxonomy
From [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564) and [MongoDB's guide](https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory):
- **Factual Memory**: Knowledge, facts, project documentation
- **Experiential Memory**: Insights, patterns, lessons learned from past tasks
- **Working Memory**: Active context for current task

### B. The Three-Tier Memory Architecture
From [Machine Learning Mastery](https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/):
1. **Episodic**: Past experiences and interactions
2. **Semantic**: General knowledge and facts
3. **Procedural**: How-to knowledge and skills

### C. Memory Consolidation Best Practices
From [Mem0 research](https://arxiv.org/abs/2504.19413):
- Contradictory information should be resolved (prioritize recent information)
- Duplicates must be minimized
- Related memories should be appropriately merged
- Build thread-scoped short-term memory AND cross-session long-term memory

### D. Context Window Management for Claude Code
From [Claude Code docs](https://code.claude.com/docs/en/memory) and [community patterns](https://claudefa.st/blog/guide/mechanics/context-management):
- Session Memory writes summaries continuously in the background
- `/compact` loads pre-written summary into fresh context window
- Avoid the last 20% of context for multi-file work
- Divide work into context-sized chunks with natural breakpoints

### E. The Institutional Historian Pattern
From [The New Stack](https://thenewstack.io/memory-for-ai-agents-a-new-paradigm-of-context-engineering/):
> "The system becomes an institutional historian, one that captures the tacit knowledge stored inside an organization."

This is exactly what team memory directories should be -- institutional knowledge that survives individual sessions.

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Implement the Slavka Memory Pattern across all teams** -- restructure each team's memory as pointers in CLAUDE.md referencing detailed guides | CRITICAL |
| 2 | **Add experiential memory** -- after each workflow completion, agents append a "lessons learned" entry to their team's memory | CRITICAL |
| 3 | **Implement memory consolidation** -- a periodic skill that merges, deduplicates, and resolves contradictions across team memories | IMPORTANT |
| 4 | **Separate memory tiers**: `memory/facts/` for stable knowledge, `memory/episodes/` for session logs, `memory/procedures/` for how-to guides | IMPORTANT |
| 5 | **Add `/compact` checkpoints to workflow Skills** -- explicit context clearing between workflow phases | IMPORTANT |
| 6 | **Create a cross-team knowledge index** -- a lightweight file the Director reads to know what each team has learned | NICE-TO-HAVE |

---

# 5. QUALITY ASSURANCE IN AGENT SYSTEMS

## Key Findings

### A. Anthropic's Eval-Driven Development
From [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents):
- Start with 20-50 tasks drawn from real failures
- Two domain experts should independently reach the same pass/fail verdict
- Balance problem sets: test both when behaviors should AND shouldn't occur
- Grade outcomes, not paths (don't penalize creative valid solutions)
- Read transcripts regularly to verify graders work correctly

### B. Three Types of Graders
| Type | Pros | Cons |
|------|------|------|
| Code-based | Fast, cheap, reproducible | Brittle to valid variations |
| Model-based | Handles nuance, open-ended | Non-deterministic, needs calibration |
| Human | Gold standard | Expensive, slow |

### C. The CLEAR Framework
From [enterprise evaluation research](https://arxiv.org/html/2511.14136v1):
- **C**ost: Resource efficiency
- **L**atency: Response time
- **E**fficacy: Task completion quality
- **A**ssurance: Safety and compliance
- **R**eliability: Consistency across runs

### D. Key Metrics
- **pass@1**: First-try success rate (most important for production)
- **pass@k**: Probability of at least one success across k attempts
- **pass^k**: Probability ALL k trials succeed (measures consistency)

### E. Multi-Agent Quality Patterns
From [OpenObserve's case study](https://openobserve.ai/blog/autonomous-qa-testing-ai-agents-claude-code/):
- **The Analyst** focuses solely on feature analysis
- **The Sentinel** blocks the pipeline for critical issues
- **The Healer** iterates up to 5 times per test to self-fix

This Analyst/Sentinel/Healer pattern maps directly to your team structure.

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Add a Sentinel/Evaluator agent to each team** -- reviews output before Director accepts it, blocks for critical issues | CRITICAL |
| 2 | **Create an eval suite of 20-50 real failure cases** -- drawn from actual bad outputs your swarm has produced | CRITICAL |
| 3 | **Implement pass@1 tracking** -- log first-try success rates for each agent and workflow to identify weak spots | IMPORTANT |
| 4 | **Add model-based grading for subjective outputs** -- use Claude to grade Writing and Design agent output against rubrics | IMPORTANT |
| 5 | **Implement the "Healer" pattern** -- agents get up to 3 retry attempts with specific feedback before escalating to the Director | IMPORTANT |
| 6 | **Create team-specific quality rubrics** -- Writing quality rubric, Engineering quality rubric, Design quality rubric | NICE-TO-HAVE |

---

# 6. HOOKS AND AUTOMATION

## Key Findings

### A. Hook Event Lifecycle
From [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks-guide):
- **SessionStart**: Inject context at session start
- **UserPromptSubmit**: Before user prompt is processed
- **PreToolUse**: Before a tool runs (preventive control)
- **PostToolUse**: After a tool completes (reactive automation)
- **Notification**: When Claude sends alerts
- **Stop / SubagentStop**: When agent finishes response (quality gates)

### B. Three Hook Types
1. **`type: "command"`**: Runs a shell command (most common)
2. **`type: "prompt"`**: Single-turn LLM evaluation
3. **`type: "agent"`**: Multi-turn LLM verification with tool access

### C. Quality Gate Hooks (Stop Event)
From [JP Caparas on Dev Genius](https://blog.devgenius.io/claude-code-use-hooks-to-enforce-end-of-turn-quality-gates-5bed84e89a0d) and [ChatPRD](https://www.chatprd.ai/how-i-ai/workflows/automate-code-quality-and-fixes-with-ai-stop-hooks):
- Stop hooks enforce "always-run" quality gates without relying on the model to remember
- Use exit code 2 for blocking checks (security, compliance, safety gates)
- Common patterns: lint check, type check, test suite, output validation

### D. Auto-Format on Edit
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

### E. Fix-and-Commit Loops
From [GitHub showcase](https://github.com/ChrisWiles/claude-code-showcase):
An automated loop: check -> fail -> fix -> re-check -> pass -> commit. The entire cycle happens without manual intervention.

### F. Multi-Agent Pipeline with Hooks
From [claude-pipeline](https://github.com/aaddrick/claude-pipeline):
Complete development pipelines combine skills, agents, hooks, orchestration scripts, and quality gates as an integrated system.

## Specific Actionable Improvements

| # | Improvement | Priority |
|---|-----------|----------|
| 1 | **Add Stop hooks for quality gates** -- lint, typecheck, and test validation after every agent turn | CRITICAL |
| 2 | **Add SessionStart hooks** -- inject current project state, recent changes, and team context automatically | IMPORTANT |
| 3 | **Add PostToolUse auto-format hooks** -- auto-format code after every Edit/Write operation | IMPORTANT |
| 4 | **Add PreToolUse security hooks** -- block dangerous operations (force push, delete protected files, etc.) | IMPORTANT |
| 5 | **Implement fix-and-commit loops** -- agents auto-fix quality gate failures up to 3 times before escalating | IMPORTANT |
| 6 | **Add SubagentStop hooks** -- validate team agent output before the Director processes it | NICE-TO-HAVE |

---

# PRIORITY SUMMARY: TOP 10 IMPROVEMENTS

Ranked by impact-to-effort ratio:

| Rank | Improvement | Area | Priority |
|------|-----------|------|----------|
| 1 | **Adopt the Slavka Memory Pattern** -- restructure all team memories as read-on-demand guides | Memory | CRITICAL |
| 2 | **Reduce active agents to 3-5 per workflow phase** -- spawn only what's needed per phase | Agents | CRITICAL |
| 3 | **Add Stop hooks for quality gates** -- automated lint/type/test after every turn | Hooks | CRITICAL |
| 4 | **Add Evaluator/Sentinel agents** -- critic agents that grade output before Director accepts | Quality | CRITICAL |
| 5 | **Map workflows to canonical orchestration patterns** -- Pipeline, Parallel Specialists, or Swarm | Coordination | CRITICAL |
| 6 | **Restructure agent prompts to single-objective** -- one clear deliverable per invocation | Prompts | CRITICAL |
| 7 | **Implement experiential memory** -- agents log lessons learned after each workflow | Memory | CRITICAL |
| 8 | **Enforce Delegate Mode for Director** -- Director coordinates only, never implements | Coordination | IMPORTANT |
| 9 | **Add SessionStart hooks** -- auto-inject project context at session start | Hooks | IMPORTANT |
| 10 | **Create eval suite from real failures** -- 20-50 failure cases for regression testing | Quality | IMPORTANT |

---

# SOURCES

## Claude Code Official Documentation
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Manage Claude's memory](https://code.claude.com/docs/en/memory)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

## Anthropic Engineering Blog
- [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## Community Guides and Analysis
- [Addy Osmani: Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Slavka Memory Pattern (Issue #24718)](https://github.com/anthropics/claude-code/issues/24718)
- [Claude Code Swarm Orchestration Skill](https://gist.github.com/kieranklaassen/4f2amba89594a4aea4ad64d753984b2ea)
- [VoltAgent: awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [claude-pipeline: Multi-agent pipeline](https://github.com/aaddrick/claude-pipeline)
- [Claude Code Showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Best practices for Claude Code subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Claude Skills and CLAUDE.md practical guide](https://www.gend.co/blog/claude-skills-claude-md-guide)
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [CLAUDE.md: Best Practices from Arize](https://arize.com/blog/claude-md-best-practices-learned-from-optimizing-claude-code-with-prompt-learning/)
- [Complete Guide to CLAUDE.md](https://www.builder.io/blog/claude-md-guide)

## Research Papers and Frameworks
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564)
- [Mem0: Production-Ready AI Agents with Long-Term Memory](https://arxiv.org/abs/2504.19413)
- [Multi-Agent Blackboard Architecture](https://arxiv.org/html/2507.01701v1)
- [CLEAR Framework for Enterprise AI](https://arxiv.org/html/2511.14136v1)
- [Meta Prompting Guide](https://www.promptingguide.ai/techniques/meta-prompting)
- [DSPy Prompt Optimization](https://arize.com/blog/prompt-optimization-few-shot-prompting/)

## Industry Analysis
- [Multi-Agent System Architecture Guide 2026](https://www.clickittech.com/ai/multi-agent-system-architecture/)
- [Deloitte: Agent Orchestration 2026](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html)
- [Microsoft: AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [How AI Agents Automated QA: 700+ Test Coverage](https://openobserve.ai/blog/autonomous-qa-testing-ai-agents-claude-code/)
- [Claude Code Multiple Agent Systems: 2026 Guide](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
