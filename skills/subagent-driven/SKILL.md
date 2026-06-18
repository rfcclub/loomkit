---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks — dispatch a fresh subagent per task with review between tasks
---

# Subagent-Driven Development

## Overview

Execute an implementation plan by dispatching one fresh subagent per task. Each subagent works independently with no shared state. Review output between tasks to catch errors early.

## When to Use

- Plan has 5+ independent tasks that don't share mutable state
- Tasks are self-contained (each task has its own files)
- Need fast iteration with quality gates between tasks
- `/lk:apply` with `--subagent` flag

## Instructions

1. **Assess task independence.** Scan tasks.md. Tasks are independent if:
   - They touch different files, OR
   - They touch the same file but in non-overlapping sections, OR
   - Task 2 only depends on Task 1's output (files on disk), not runtime state

2. **Dispatch subagents.** For each independent task:
   - Spawn a fresh subagent with the task description + exact code from the plan
   - The subagent writes tests → implements → verifies → commits
   - Subagent returns: success/failure, files changed, test results

3. **Review between tasks.** After each subagent completes:
   - Read the changed files (diff review)
   - Verify tests pass (`npx vitest run` or configured framework)
   - If failed: diagnose, fix, or re-dispatch
   - If passed: mark task `[x]`, proceed to next

4. **Two-stage review for critical tasks.** For tasks marked `[CRITICAL]` in the plan:
   - Stage 1: Implementation subagent writes code
   - Stage 2: Review subagent verifies correctness independently
   - Only mark complete after both pass

5. **Serial tasks.** Tasks that depend on prior output:
   - Wait for prior subagent to complete and commit
   - Dispatch next subagent with updated file context
   - Never dispatch dependent tasks in parallel

## Rules

- One subagent = one task. Do not combine tasks into one subagent.
- Subagents must NOT share in-memory state. Only filesystem state.
- Review every subagent's output before dispatching the next.
- If a subagent fails 3 times on the same task, stop and investigate manually.
