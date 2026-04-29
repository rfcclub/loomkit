---
name: spec
description: Use when formalising requirements as structured specs with scenarios (WHEN/THEN), outputting specs/<name>/spec.md
---

# Spec

## Overview

Write requirements-as-code using RFC 2119 keywords and WHEN/THEN scenarios. Specs become the test contract for TDD.

## When to Use

- After brainstorming — formal requirements needed
- Before design — requirements must be clear first
- When a spec needs updating (after archive merges)
- `/lk:spec` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Identify capabilities.** What system boundaries does this affect?
2. **Write `### Requirement:` blocks.** Each starts with RFC 2119 keyword:
   - `SHALL` / `MUST` — mandatory (these drive test coverage gates)
   - `SHOULD` — recommended
   - `MAY` — optional
3. **For each Requirement, write `#### Scenario:` blocks.**
   - Format: `WHEN <condition> THEN <expected outcome>`
   - Multiple AND clauses OK in WHEN or THEN
   - NO OR in scenarios — split into separate scenarios
   - Scenario ID: auto-increment (`SC-001`, `SC-002`...)
4. **Save to** `specs/<capability>/spec.md` inside the change directory:
   `changes/<name>/specs/<capability>/spec.md`
5. If updating living specs (not a change), save to `specs/<capability>/spec.md` at project root.

## Output

- `changes/<name>/specs/<capability>/spec.md`

## Validation

- Every `### Requirement:` starts with SHALL/MUST/SHOULD/MAY
- Every Requirement has ≥1 Scenario
- No OR in Scenario WHEN/THEN clauses
- Each Scenario ID is unique within the file
- Scenarios are translatable to test cases (concrete conditions)

## Anti-Patterns

- `OR` in scenarios — always split
- Vague conditions ("WHEN user does something") — be concrete
- Requirements without scenarios (they can't be tested)
- Mixing SHALL and SHOULD in same requirement — keep separate
- Writing implementation details in scenarios (that's design's job)
