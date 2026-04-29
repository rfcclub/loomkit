import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { getChangeDir, changeExists } from '../utils.js';

const DEFAULT_TASKS = `# Implementation Plan: {{NAME}}

## Preparation

- [ ] Review spec scenarios for {{NAME}}
- [ ] Review design.md test strategy

## Tasks

### Task 1: <!-- Brief description -->

**Files:**
- Create: <!-- src/file.ts -->
- Test: <!-- tests/file.test.ts -->

- [ ] **Step 1: Write the failing test**
  \`\`\`ts
  // TODO: write test
  \`\`\`

  Run: \`npx vitest run tests/...\`
  Expected: FAIL

- [ ] **Step 2: Write minimal implementation**
  \`\`\`ts
  // TODO: implement
  \`\`\`

  Run: \`npx vitest run tests/...\`
  Expected: PASS

- [ ] **Step 3: Commit**
  \`\`\`bash
  git add -A && git commit -m "feat: {{commit message}}"
  \`\`\`

## Verification

- [ ] All scenarios passing (coverage = 100%)
- [ ] \`.traceability.yaml\` updated
`;

export function cmdPlan(name: string): void {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found. Run "loomkit spec ${name}" first.`);
    process.exit(1);
  }

  const changeDir = getChangeDir(name);
  const planPath = join(changeDir, 'tasks.md');

  if (existsSync(planPath)) {
    console.error(`✗  Plan already exists at ${planPath}`);
    process.exit(1);
  }

  const content = DEFAULT_TASKS.replace(/{NAME}/g, name);
  writeFileSync(planPath, content, 'utf-8');
  console.log(`✓  Created tasks.md for "${name}"`);
  console.log(`  ${planPath}`);
  console.log('\n💡  Next: implement TDD, then loomkit verify ' + name);
}
