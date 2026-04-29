---
name: plan
description: Use when creating bite-sized TDD tasks with exact code, no placeholders, mapped to spec scenarios
---

# Plan

## Overview

Break design into bite-sized tasks (2-5 min each). Every step has exact code, no placeholders, no TBD. Each task follows RED/GREEN/REFACTOR.

## When to Use

- After design is approved — plan before implementation
- When breaking down a complex feature into tractable steps
- `/lk:plan` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Read design.md and spec.** Understand the full scope.
2. **Decompose into Tasks.** Each Task is ~2-5 minutes of work. Each Task has:
   - **Files** section with line items: Create / Modify / Test
   - Test file(s) first (RED phase)
   - Implementation file(s) (GREEN phase)
3. **Every step has exact code.** No:
   - `// implement later`
   - `// TODO`
   - `// similar to Task 1` (no cross-references)
   - `// placeholder`
4. **Each step ends with a commit** after GREEN passes.
5. **TDD cycle per Task:**
   - Write failing test (RED) → verify fail → implement (GREEN) → verify pass → commit
   - VERIFY step at end of each task
6. **Reference spec scenarios by ID** so traceability is clear.
7. **Write `tasks.md`** in `changes/<name>/tasks.md`.

## Output

- `changes/<name>/tasks.md`

## Validation

- Every task has concrete Files section
- Every code block is complete (no placeholders, no TBD)
- No cross-task references
- Each task references at least one scenario ID
- Task order is buildable (prerequisites first)

## Anti-Patterns

- Placeholders ("implement the logic here") — banned
- Cross-references ("same as Task 3") — banned
- Tasks >5 minutes — split further
- Missing test file reference in RED phase
- Referencing design decisions not yet implemented
