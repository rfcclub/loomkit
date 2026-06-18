---
name: executing-plans
description: Use when you have a written implementation plan (tasks.md) to execute step-by-step with review checkpoints
---

# Executing Plans

## Overview

Read an implementation plan produced by the plan phase and execute tasks sequentially. Each task is verified before moving to the next. Pause at review checkpoints.

## When to Use

- After plan phase — tasks.md exists and is ready for implementation
- When continuing work from a partially-executed plan
- `/lk:apply` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Load the plan.** Read `loomkit/changes/<name>/tasks.md`. Identify:
   - Total task count
   - Completed tasks (checkboxes marked `[x]`)
   - Next pending task
   - Dependencies between tasks

2. **Execute tasks sequentially.** For each pending task:
   - Read the task description and code blocks
   - Follow TDD cycle: RED → GREEN → REFACTOR
   - Mark the task `[x]` when done
   - Commit with the task description as the commit message

3. **Review checkpoints.** After every 3-5 tasks or at section boundaries:
   - Run the full test suite
   - Verify no regressions
   - Pause and report progress
   - If the plan says "REVIEW CHECKPOINT", stop and wait for human approval

4. **Handle deviations.** If implementation reveals a better approach:
   - Document the deviation in a comment on the task
   - Continue with the better approach
   - If the deviation is significant, pause and flag for human review

5. **On completion.** After all tasks are done:
   - Run `loomkit verify <name>`
   - Report final coverage and status

## Rules

- Do not skip tasks unless explicitly marked optional
- Do not implement beyond what the plan specifies
- If a task is unclear, pause and ask — do not guess
- Each commit should correspond to one task
