---
name: git-workflow
description: >
  Wraps implementation workflows with GitHub Flow git lifecycle. Creates a feature
  branch, delegates to existing workflow skills, commits, opens a PR, evaluates,
  and merges. Use for any feature that should go through PR review.
user-invocable: true
---

# Git Workflow

Use this workflow when a feature, fix, or chore should go through a PR rather than committing directly to main. This wraps existing workflow skills with git lifecycle management.

## Before Starting

1. Read `.claude/memory/engineering-team/` for any branch or PR conventions
2. Verify `main` is clean and builds: `npm run build`
3. Determine the branch type (`feature/`, `fix/`, `chore/`) and a kebab-case name

## Workflow Steps

### Step 1: Branch Creation
Spawn the **git-ops** agent with:
- Request: create a feature branch from latest `main`
- Branch name based on the task (e.g. `feature/scale-bar-redesign`)

Wait for branch confirmation.

### Step 2: Implementation
Invoke the appropriate existing workflow skill:
- Code work → `/engineering-workflow`
- Content work → `/writing-workflow`
- Visual design → `/design-workflow`
- Map review → `/domain-review`

All implementation happens on the feature branch.

### Step 3: Commit Checkpoint
Spawn the **git-ops** agent with:
- Request: stage all changed files, commit with a descriptive message, push to remote
- Provide a summary of what changed for the commit message

Wait for push confirmation.

### Step 4: Build Verification
Run `npm run build` to verify TypeScript compiles and Vite bundles correctly.
If the build fails, fix the issues (spawn appropriate dev agent), then repeat Step 3.

### Step 5: Create PR
Spawn the **git-ops** agent with:
- Request: rebase on main, create PR with summary and test plan
- Provide a change summary for the PR description

Wait for PR URL.

### Step 6: Evaluation
Invoke `/evaluate-cycle` on the branch:
- Code QA, visual QA, retrospective
- Any findings should be fixed and committed (repeat Steps 3-4 if needed)

### Step 7: Merge and Cleanup
Spawn the **git-ops** agent with:
- Request: squash merge the PR, delete the feature branch, verify build on main

Wait for merge confirmation.

## After Completion

Update `.claude/memory/engineering-team/` with:
- Branch and PR conventions used
- Any merge issues encountered
- Build verification results
