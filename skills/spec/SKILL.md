---
name: spec
description: Use when a proposal has been approved and requirements need to be written as structured, testable scenarios
---

# Spec

## Overview

Write requirements-as-code using RFC 2119 keywords and WHEN/THEN scenarios. Each scenario maps directly to a test case. Specs are the source of truth for what the system must do.

## When to Use

- After a proposal is approved (proposal.md exists)
- Before any design work begins
- When adding a new capability (new spec file)
- When modifying an existing capability (delta spec)

## Instructions

### 1. Create the Change Directory

Ensure `loomkit/changes/<change-name>/` exists (created by brainstorm phase).

### 2. Create Spec Files

For each capability listed in the proposal, create `loomkit/changes/<change-name>/specs/<capability-name>/spec.md`.

Use the template from `loomkit/schemas/spec-driven/templates/spec.md`:

```markdown
## ADDED Requirements

### Requirement: <requirement-name>
<requirement text using SHALL/MUST/SHOULD>

#### Scenario: <scenario-name>
- **WHEN** <condition>
- **THEN** <expected outcome with assertion (=, !=, contains, matches, >, <, is a)>
```

#### RFC 2119 Keywords

| Keyword | Meaning | Gate |
|---------|---------|------|
| **SHALL** / **MUST** | Absolute requirement | Mandatory for verify gate |
| **SHOULD** | Recommended, may be omitted | Optional |
| **MAY** | Truly optional | Optional |

- Mandatory scenarios (under SHALL/MUST) are checked by the verify gate
- Use SHALL for system behavior, MUST for API contracts

#### WHEN/THEN Rules

- **No OR in WHEN or THEN** — split into separate scenarios
- **Multiple AND clauses OK** in both WHEN and THEN
- Each scenario tests exactly one behavior
- WHEN describes the triggering condition
- THEN describes expected outcome with typed assertion
- Scenario names must be unique within the spec

#### Assertion Types

| Assertion | Meaning | Usage |
|-----------|---------|-------|
| `=` | equals | exact value match |
| `!=` | not equals | value mismatch |
| `contains` | contains value | string/array inclusion |
| `matches` | matches pattern | regex or type match |
| `>` / `<` | comparison | numeric comparison |
| `is a` | type check | instanceof / typeof |

#### Spec File Types

**Delta spec** (in `loomkit/changes/<name>/specs/`):
- `## ADDED Requirements` — new requirements for this change
- `## MODIFIED Requirements` — existing requirements being changed
- `## REMOVED Requirements` — requirements being removed
- `## RENAMED Requirements` — requirements being renamed

Use deltas for proposed changes. Living specs are updated during archive.

### 3. Spec Self-Review

After writing all spec files, review:

- [ ] Every capability from the proposal has at least one spec file
- [ ] Every Requirement uses an RFC 2119 keyword (SHALL/MUST/SHOULD)
- [ ] Every Requirement has at least one Scenario
- [ ] No OR in any WHEN or THEN clause
- [ ] Each Scenario name is unique within its spec
- [ ] THEN assertions use the correct typed assertion operators
- [ ] Scenarios are testable — each one implies a concrete test

## Output

- `loomkit/changes/<change-name>/specs/<capability-name>/spec.md` (one per new capability)
- Or: delta spec files for modified capabilities

## Validation

- [ ] Run the spec parser/validator: `npx tsx src/spec/parser.ts loomspec/changes/<change-name>/specs/`
- [ ] Every requirement has ≥1 scenario
- [ ] All scenarios use WHEN/THEN format
- [ ] No OR in any clause
- [ ] RFC 2119 keywords are correct for each requirement

## Anti-Patterns

- Writing scenarios with OR in WHEN/THEN — split them
- Scenarios that describe implementation ("WHEN method X is called") instead of behavior ("WHEN user submits empty form")
- Vague THEN clauses without typed assertions
- Requirements without any scenarios
- Copying spec structure without understanding the behavior
- Scenarios that cannot be translated to test cases
- Writing implementation details in specs — specs define WHAT, not HOW
