---
name: verify
description: Use after TDD implementation is complete, before archiving — checks scenario coverage and runs the full test suite
---

# Verify

## Overview

Run the verification gate before archiving. Checks that every mandatory scenario (SHALL/MUST) has a passing test, runs the full test suite, and generates a coverage report. If verification fails, the change cannot be archived without a force reason.

## When to Use

- After all TDD tasks are implemented
- Before running the archive phase
- When checking progress during implementation
- When a coverage check is needed

## Instructions

### 1. Check Scenario Coverage

Only mandatory scenarios (under requirements using **SHALL** or **MUST**) are checked. SHOULD and MAY scenarios are optional.

Read the spec files from `loomkit/changes/<change-name>/specs/`:

For each `### Requirement:` that uses SHALL or MUST:
- Extract all `#### Scenario:` entries
- Count them as mandatory

Read `.traceability.yaml` from `loomkit/changes/<change-name>/`:

For each mandatory scenario:
- Check there is a traceability entry with `status: "passing"`
- Check the referenced test file exists

### 2. Run Test Suite

```bash
vitest run --reporter=verbose
```

Or with coverage:

```bash
vitest run --coverage --reporter=verbose
```

Confirm:
- Exit code is 0
- All tests pass (0 failures)
- No skipped tests for mandatory scenarios

### 3. Generate Coverage Report

Run the coverage gate tool:

```bash
npx tsx src/verify/verify.ts --change loomkit/changes/<change-name>/
```

This checks:
- Scenario coverage (% of mandatory scenarios with passing tests)
- Test suite status (all passing)
- Traceability consistency (no orphan scenarios, no orphan tests)

### 4. Output .loomkit-verify.json

Write to `loomkit/changes/<change-name>/.loomkit-verify.json`:

```json
{
  "change": "<change-name>",
  "timestamp": "2026-04-29T07:57:00.000Z",
  "coverage": {
    "mandatory_scenarios": 10,
    "covered_scenarios": 10,
    "uncovered_scenarios": 0,
    "coverage_percent": 100
  },
  "tests": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0,
    "suite_status": "passing"
  },
  "traceability": {
    "entries": 10,
    "orphan_scenarios": 0,
    "orphan_tests": 0,
    "consistent": true
  },
  "passed": true
}
```

### 5. Result Interpretation

**If `passed: true`** — change is ready for archive. Proceed to archive phase.

**If `passed: false`** — do not archive. Return to TDD phase to fix uncovered scenarios or failing tests.

**Force option:** If verification fails but archive must proceed (e.g., test infrastructure issues), document the reason and use force archive. See archive/SKILL.md.

## Output

- `loomkit/changes/<change-name>/.loomkit-verify.json`

## Validation

- [ ] `.loomkit-verify.json` has valid JSON format
- [ ] All mandatory scenarios have passing tests
- [ ] Coverage reflects only SHALL/MUST scenarios (not SHOULD/MAY)
- [ ] Test suite ran fresh (not cached results)
- [ ] Traceability is consistent (no orphans)
- [ ] If `passed: false`, uncovered scenarios are explicitly listed

## Anti-Patterns

- Checking coverage against all scenarios (including SHOULD/MAY) instead of only SHALL/MUST
- Running the test suite without --reporter=verbose (hides individual test status)
- Using cached test results instead of a fresh run
- Marking `passed: true` when tests have failures or skipped tests
- Reporting coverage without checking traceability consistency
- Ignoring orphan scenarios (scenarios in spec but not in traceability)
- Ignoring orphan tests (tests in traceability but not in spec)
- Proceeding to archive when verification fails without force reason
