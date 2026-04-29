---
name: design
description: Use when specs are written and approved, before creating the implementation plan — produces a technical design with architecture decisions and test strategy
---

# Design

## Overview

Translate requirements into a technical design. Document architecture decisions with rationale, map scenarios to test files, and define the file structure. The design bridges "what to build" (spec) and "how to build it" (plan).

## When to Use

- After spec files are written and approved
- Before creating the implementation plan (tasks.md)
- When architecture decisions need to be documented

## Instructions

### 1. Read Context

- `loomkit/changes/<change-name>/proposal.md` — motivation and scope
- `loomkit/changes/<change-name>/specs/` — all spec files with requirements and scenarios
- `loomkit/specs/` — existing living specs (for understanding current architecture)
- `loomkit/config.yaml` — project config (stack, framework, rules)

### 2. Design the Solution

Work through these areas in order:

#### Architecture Decisions

For each significant design decision:
- State the decision clearly
- Provide rationale (why this approach over alternatives)
- Note alternatives considered and why they were rejected

Examples of decisions to document:
- Module/file boundaries and responsibilities
- Data model changes (entities, fields, relationships)
- API design (interfaces, types, function signatures)
- Framework/library choices
- Error handling approach
- State management

#### File Structure

List every file that will be created or modified:

```
src/
├── new-module/
│   ├── handler.ts       # NEW — handles X
│   └── types.ts         # NEW — types for X
├── existing/
│   └── service.ts       # MODIFY — add Y method (lines 50-80)
tests/
├── new-module/
│   └── handler.test.ts  # NEW — tests for handler
└── existing/
    └── service.test.ts  # MODIFY — tests for Y method
```

#### Data Model Changes

If any data structures change:
- New types/interfaces
- Modified fields
- New constants or enums
- Database schema changes (if applicable)

#### Test Strategy

Map every scenario from the spec to a test file. Be explicit:

| Scenario ID | Test File | Test Name |
|-------------|-----------|-----------|
| FOO-REQ1-SC1 | `tests/foo/handler.test.ts` | rejects empty email |
| FOO-REQ1-SC2 | `tests/foo/handler.test.ts` | accepts valid email |
| FOO-REQ2-SC1 | `tests/foo/service.test.ts` | retries on failure |

Every scenario must be covered. Every test file must have at least one scenario mapped to it.

### 3. Write design.md

Write to `loomkit/changes/<change-name>/design.md`:

Use the template from `loomkit/schemas/spec-driven/templates/design.md`:

```markdown
## Context

<!-- Background, current state, constraints -->

## Goals / Non-Goals

**Goals:**
<!-- What this design achieves -->

**Non-Goals:**
<!-- What is explicitly out of scope -->

## Decisions

<!-- Key design decisions with rationale. Include alternatives considered. -->

## Test Strategy

<!-- How scenarios map to tests. Which framework. Key test patterns. -->

## Risks / Trade-offs

<!-- Known risks and mitigations -->

## Open Questions

<!-- Outstanding decisions -->
```

### 4. Self-Review

- [ ] Every scenario from every spec is mapped to a test file
- [ ] File structure covers all files (create + modify)
- [ ] Architecture decisions have rationale, not just statements
- [ ] Multiple alternatives considered for non-trivial decisions
- [ ] Non-goals section documents what is explicitly out of scope
- [ ] Risks are identified with mitigations

## Output

- `loomkit/changes/<change-name>/design.md`

## Validation

- [ ] Every scenario from spec files appears in the test strategy table
- [ ] All test files listed exist or will be created
- [ ] Architecture decisions include rationale
- [ ] File structure is complete (no missing files)
- [ ] Design does not contradict spec requirements
- [ ] Design is implementable — a developer could write code from this

## Anti-Patterns

- Writing design before specs are done — design must be driven by requirements
- No test strategy section — every design must show scenario→test mapping
- Making decisions without documenting rationale
- Over-engineering — building for future needs not in current specs (YAGNI)
- Omitting non-goals — not saying what's out of scope causes scope creep
- Design that contradicts spec requirements
- Vague file structure without specific paths
- No risk assessment for complex decisions
