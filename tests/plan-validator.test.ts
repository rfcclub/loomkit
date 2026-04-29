import { describe, it, expect } from 'vitest';
import { validatePlan } from '../src/plan/validator.js';

describe('Plan Validator', () => {
  it('detects placeholders (TBD, TODO, implement later, fill in)', () => {
    const plan = `## 1. Setup\n\n### Task 1: Init\n\n- [ ] **Step 1: Write failing test**\n\nTBD: add test code later\n`;
    const result = validatePlan(plan);
    expect(result.errors).toContainEqual(expect.stringContaining('placeholder'));
  });

  it('detects vague instructions without code blocks', () => {
    const plan = `## 1. Setup\n\n### Task 1: Init\n\n- [ ] **Step 1: Add error handling**\n\nAdd appropriate error handling.\n`;
    const result = validatePlan(plan);
    expect(result.errors).toContainEqual(expect.stringContaining('vague'));
  });

  it('detects cross-task references (similar to Task N)', () => {
    const plan = `## 1. Setup\n\n### Task 1: A\n\n- [ ] **Step 1: Write test**\n\n\`\`\`ts\ntest('x', () => {});\n\`\`\`\n\n### Task 2: B\n\n- [ ] **Step 1: Write test**\n\nSimilar to Task 1.\n`;
    const result = validatePlan(plan);
    expect(result.errors).toContainEqual(expect.stringContaining('cross-reference'));
  });

  it('detects missing file paths in steps', () => {
    const plan = `## 1. Setup\n\n### Task 1: Init\n\n- [ ] **Step 1: Write failing test**\n\nWrite a test for email validation.\n`;
    const result = validatePlan(plan);
    expect(result.errors).toContainEqual(expect.stringContaining('file path'));
  });

  it('detects implementation step before test step within a task', () => {
    const plan = `## 1. Setup\n\n### Task 1: Init\n\n**Files:**\n- Create: src/x.ts\n- Test: tests/x.test.ts\n\n- [ ] **Step 1: Write implementation**\n\n\`\`\`ts\nexport function validate() {}\n\`\`\`\n\n- [ ] **Step 2: Write failing test**\n\n\`\`\`ts\ntest('validates', () => {});\n\`\`\`\n`;
    const result = validatePlan(plan);
    expect(result.errors).toContainEqual(expect.stringContaining('implementation before test'));
  });

  it('passes on valid TDD plan with exact code and file paths', () => {
    const plan = `## 1. Setup\n\n### Task 1: Email validation\n\n**Files:**\n- Create: src/validate.ts\n- Test: tests/validate.test.ts\n\n- [ ] **Step 1: Write the failing test**\n\n\`\`\`ts\ntest('validates email', () => {\n  expect(validate('a@b.com')).toBe(true);\n});\n\`\`\`\n\n- [ ] **Step 2: Run test to verify it fails**\n\nRun: vitest run tests/validate.test.ts\nExpected: FAIL\n\n- [ ] **Step 3: Write minimal implementation**\n\n\`\`\`ts\nexport function validate(email: string): boolean {\n  return email.includes('@');\n}\n\`\`\`\n\n- [ ] **Step 4: Run test to verify it passes**\n\nRun: vitest run tests/validate.test.ts\nExpected: PASS\n\n- [ ] **Step 5: Commit**\n\n\`\`\`bash\ngit add tests/validate.test.ts src/validate.ts && git commit -m "feat: email validation"\n\`\`\`\n`;
    const result = validatePlan(plan);
    expect(result.valid).toBe(true);
  });
});
