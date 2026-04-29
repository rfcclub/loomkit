---
name: plan
description: Use when design is approved, before writing any code — produces bite-sized TDD tasks with exact code for every step, no placeholders
---

# Plan

## Overview

Translate the design into bite-sized implementation tasks. Each task is 2-5 minutes of work. Every step has exact code — no placeholders, no TODOs, no "implement later". Tasks follow TDD: write failing test → verify fail → implement → verify pass → commit.

## When to Use

- After the design document (design.md) is approved
- Before any code is written
- When the implementation has multiple distinct steps

## Instructions

### 1. Read Context

- `loomkit/changes/<change-name>/design.md` — architecture and test strategy
- `loomkit/changes/<change-name>/specs/` — all spec files
- `loomkit/config.yaml` — for TDD settings (framework, enforce, coverage threshold)

### 2. Decompose into Tasks

Split the work into logical tasks. Each task produces a self-contained, testable piece of functionality.

**Task boundaries:**
- One task per component or behavior
- Each task has 3-6 steps (2-5 minutes each)
- Tasks should be independent — no cross-task references
- Each task maps to at least one scenario from the spec

### 3. Write Each Task

Use this structure for every task:

```markdown
### Task N: <Component Name>

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:line-range`
- Test: `tests/exact/path/to/test.ts`

**Scenario coverage:** FOO-REQ1-SC1, FOO-REQ1-SC2

- [ ] **Step 1: Write the failing test**

```typescript
test('specific behavior', () => {
  // Exact test code — no placeholders
  const result = functionUnderTest(input);
  expect(result).toBe(expected);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vitest run tests/path/test.ts --reporter=verbose`
Expected: FAIL — <expected failure reason>

- [ ] **Step 3: Write minimal implementation**

```typescript
// Exact implementation code — no placeholders
function functionUnderTest(input: string): string {
  return expected;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vitest run tests/path/test.ts --reporter=verbose`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.ts src/path/file.ts
git commit -m "feat: component description"
```
```

### 4. Enforce No Placeholders

After writing the complete plan, scan for these patterns — they are **plan failures**:

| Failure | Fix |
|---------|-----|
| `TBD`, `TODO`, `implement later` | Replace with actual code |
| `Add appropriate error handling` | Show the exact error handling code |
| `Write tests for the above` | Write the exact test code |
| `Similar to Task N` | Repeat the code — tasks may be read out of order |
| `Handle edge cases` | List exact edge cases with exact assertions |
| Steps that say what to do without showing code | Every code step must contain code |

### 5. Self-Review

- [ ] Every scenario from the spec is covered by at least one task
- [ ] Each step has exact code (not description of what to write)
- [ ] No placeholders, TODOs, or "implement later"
- [ ] No cross-task references ("similar to Task 2")
- [ ] Types/method signatures are consistent across tasks
- [ ] Each task follows TDD cycle (fail → implement → pass → commit)
- [ ] File paths match the ones from design.md
- [ ] Test files listed match the test strategy in design.md

### 6. Write tasks.md

Write to `loomkit/changes/<change-name>/tasks.md`.

## Output

- `loomkit/changes/<change-name>/tasks.md`

## Validation

- [ ] Every task has Files section with exact paths
- [ ] Every code step has actual code (not descriptions)
- [ ] No placeholder strings (TBD, TODO, implement later)
- [ ] No cross-task references
- [ ] Every scenario from the spec is mapped to a task
- [ ] Each step is self-contained (2-5 min)
- [ ] Consistent with the test strategy from design.md

## Anti-Patterns

- Writing tasks without exact code — the agent should be able to copy-paste every step
- Cross-task references — tasks may be executed in any order
- Placeholders or "implement later" — every step must be complete now
- Vague implementations without error handling
- Tasks that are too large (>10 min per step)
- Tasks that don't reference spec scenarios
- Skipping the TDD cycle in any step — always write test first, verify fail, then implement
- Committing at the end of the plan instead of after each task
