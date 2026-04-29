---
name: design
description: Use when producing a technical design document with architecture decisions, test strategy, and file changes
---

# Design

## Overview

Produce a technical design document covering architecture decisions, test strategy mapped to spec scenarios, file structure, and data model changes.

## When to Use

- After spec is approved — design before planning
- When a change needs technical review before implementation
- `/lk:design` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Read the spec.** Understand all Requirements and Scenarios.
2. **Architecture decisions + rationale.** For each key decision:
   - What was chosen
   - What alternatives were considered
   - Why this choice (trade-offs, constraints)
3. **Test strategy section.** Map each Scenario ID to a test file:
   - `SC-001 → tests/auth/login.test.ts`
   - Every SHALL/MUST scenario must have a test file mapping
   - Note: edge cases, error paths, happy path
4. **File structure changes.** List every file that changes:
   - New files: `src/auth/login.ts`
   - Modified files: `src/auth/index.ts`
   - Deleted files: (if any)
5. **Data model changes.** If the change touches data:
   - Before and after schemas
   - Migration path
6. **Write `design.md`** in `changes/<name>/design.md`.

## Output

- `changes/<name>/design.md`

## Validation

- Architecture decisions include rationale
- Test strategy maps every SHALL/MUST scenario to a file
- File structure changes are complete (no hidden dependencies)
- Data model changes include migration path (if applicable)
- Consistent with spec (no new requirements introduced)

## Anti-Patterns

- Design without reading spec first
- Missing test strategy (critical for TDD enforcement)
- Introducing new requirements not in spec
- Vague "we'll figure it out" in file changes
- Skipping data model when schema changes are needed
