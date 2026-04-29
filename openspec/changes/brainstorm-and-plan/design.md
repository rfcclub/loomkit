# Design: Brainstorm & Plan

## Approach
Brainstorm is an interactive flow (Socratic dialogue) — LoomKit provides the prompting template and validation rules, not a runtime loop. Plan generation takes the approved design + specs and generates a task list with TDD steps, validated by the no-placeholder checker.

## Brainstorm Flow (from Superpowers)
```
1. Explore project context (files, docs, commits)
2. Ask clarifying questions (one at a time)
3. Propose 2-3 approaches (with trade-offs + recommendation)
4. Present design section-by-section (user approves each)
5. Write proposal.md (to change directory)
6. Self-review proposal (placeholder scan, scope check)
7. Transition → /lk:spec to write specs
```

This is an instruction template for the AI, not executable code. LoomKit provides the template; the AI agent follows it.

## Plan Format (from Superpowers)
```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`
- Test: `tests/exact/path/to/test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
test('specific behavior', () => {
  const result = function(input);
  expect(result).toBe(expected);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vitest run tests/path/test.ts --reporter=verbose`
Expected: FAIL with "function is not defined"

- [ ] **Step 3: Write minimal implementation**

```typescript
export function function(input: Type): Output {
  return expected;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vitest run tests/path/test.ts --reporter=verbose`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.ts src/path/file.ts
git commit -m "feat: add specific feature"
```
```

## Plan Validation Rules
1. No placeholders (TBD, TODO, "implement later")
2. No vague instructions ("add error handling" without code)
3. No cross-task references ("similar to Task 3")
4. File paths required on every step
5. TDD order enforced (test before implementation)
6. Exact code in every step
7. Expected test output specified

## Self-Review (from Superpowers)
After plan generation:
1. **Spec coverage**: every requirement → at least one task
2. **Placeholder scan**: regex for TBD/TODO/implement later/fill in
3. **Type consistency**: function names, signatures consistent across tasks

## File Layout
```
loomkit/src/brainstorm/
  template.ts          — brainstorm instruction template (for AI agent)
  validator.ts         — validate brainstorm output (proposal.md exists, no placeholders)

loomkit/src/plan/
  generator.ts         — plan generation template (TDD step structure)
  validator.ts         — no-placeholder check, TDD order check, file path check
  self-review.ts       — spec coverage, placeholder scan, type consistency
```

## Rollback
Brainstorm is interactive — no state to roll back. Plan is a markdown file — can be deleted and regenerated.
