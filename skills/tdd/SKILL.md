---
name: tdd
description: Use during implementation — enforces test-first discipline and maintains scenario→test traceability
---

# TDD (Test-Driven Development)

## Overview

Implement code using the RED/GREEN/REFACTOR cycle. The Iron Law: no production code without a failing test first. Every scenario from the spec maps to exactly one test. Traceability is maintained in `.traceability.yaml`.

## When to Use

- During implementation of any task from `tasks.md`
- Whenever writing new code or fixing bugs
- When adding features to existing code

## Instructions

### The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

**If code was written before the test:** Delete it. Start over. No exceptions.

### RED/GREEN/REFACTOR Cycle

#### RED — Write Failing Test

Write one test that demonstrates the desired behavior. Follow the spec scenarios:

- One test per scenario (or one test per logical behavior)
- Test name describes the behavior clearly
- Uses real code, not mocks (unless unavoidable)
- Tests ONE thing — if test name has "and", split it

```typescript
// GOOD: clear name, tests one behavior, matches a spec scenario
test('rejects empty email', () => {
  const result = validateEmail('');
  expect(result.error).toBe('Email required');
});

// BAD: vague name, tests multiple things
test('email stuff works', () => {
  // ...
});
```

#### Verify RED — Watch It Fail

**MANDATORY. Never skip this step.**

```bash
vitest run tests/path/to/test.ts --reporter=verbose
```

Confirm:
- Test fails (not errors)
- Failure message is the expected one ("Email required" was not returned)
- Fails because feature is missing, not because of a typo

**Test passes?** You're testing existing behavior. Fix the test.
**Test errors?** Fix the error first, then re-run until it fails correctly.

#### GREEN — Minimal Implementation

Write the simplest code to make the test pass. Nothing more.

```typescript
function validateEmail(email: string): { error?: string } {
  if (!email.trim()) {
    return { error: 'Email required' };
  }
  return {};
}
```

**Rules:**
- No extra features (YAGNI)
- No refactoring of unrelated code
- No "improving" beyond what the test requires
- Minimal = exactly enough to pass

#### Verify GREEN — Watch It Pass

**MANDATORY.**

```bash
vitest run tests/path/to/test.ts --reporter=verbose
```

Confirm:
- Test passes
- No other tests broken (run full suite)
- Output pristine (no errors, warnings)

**Test fails?** Fix the implementation, not the test.
**Other tests break?** Fix them now.

#### REFACTOR — Clean Up

After green:
- Remove duplication
- Improve names
- Extract helpers
- Improve error messages

Keep tests passing. Don't add behavior during refactor.

### Update Traceability

After each task in the TDD cycle, update `.traceability.yaml`:

```yaml
traceability:
  - scenario: "FOO-REQ1-SC1"
    description: "rejects empty email"
    test_file: "tests/validation/email.test.ts"
    test_name: "rejects empty email"
    status: "passing"
  - scenario: "FOO-REQ1-SC2"
    description: "accepts valid email"
    test_file: "tests/validation/email.test.ts"
    test_name: "accepts valid email"
    status: "passing"
```

Each entry maps one scenario ID (from the spec) to:
- `scenario` — the scenario ID from the spec
- `description` — human-readable description
- `test_file` — relative path to the test file
- `test_name` — the exact test name
- `status` — `passing`, `failing`, or `not_implemented`

### Verify Traceability Coverage

After each task, run:

```bash
npx tsx src/tdd/traceability.ts --specs loomkit/changes/<name>/specs/ --traceability loomkit/changes/<name>/.traceability.yaml
```

This checks:
- Every mandatory scenario (SHALL/MUST) has a traceability entry
- No test is mapped to a non-existent scenario
- Statuses are consistent

## Output

- Implementation code in `src/` (or appropriate source directory)
- Test files in `tests/` (or appropriate test directory)
- `.traceability.yaml` in the change directory (`loomkit/changes/<change-name>/`)

## Validation

- [ ] Every test was written before the code it tests (RED first)
- [ ] Every test was verified to fail before implementation (RED verification)
- [ ] Every test passes after implementation (GREEN verification)
- [ ] All mandatory scenarios (SHALL/MUST) have traceability entries
- [ ] `.traceability.yaml` is valid YAML with all required fields
- [ ] Traceability coverage check passes with 0 errors

## Anti-Patterns

- Writing code before tests — delete and start over
- Skipping RED verification ("I know it'll fail") — watch it fail
- Using mocks when real code would work
- Writing multiple behaviors in one test ("email and domain and whitespace")
- Adding features not in the spec during GREEN
- Not updating traceability after each task
- Refactoring without tests passing
- Writing implementation tests (testing HOW) instead of behavior tests (testing WHAT)
- Committing without verifying the full test suite still passes
