## Archive Enhancements

### Task 1: Spec merge on archive

**Files:**
- Modify: `src/cli/commands/archive.ts`

- [ ] **Step 1: Write failing test for spec merge**
  
  ```ts
  // tests/living-specs.test.ts
  import { describe, it, expect } from 'vitest';
  import { parseSpec } from '../src/spec/parser.js';
  
  it('merges delta spec into living spec on archive', () => {
    // Setup: create a change with ADDED requirement
    // Archive it
    // Verify loomkit/specs/<name>/spec.md exists
    // Verify the living spec contains the ADDED requirement
  });
  ```
  
  Run: `npx vitest run tests/living-specs.test.ts`
  Expected: FAIL (test references not-yet-implemented logic)
  
- [ ] **Step 2: Implement spec merge in archive**
  
  Modify `src/cli/commands/archive.ts`:
  ```ts
  import { parseDeltaSpec, mergeSpecs, parseSpec } from '../../spec/index.js';
  
  function mergeSpecOnArchive(name: string, changeDir: string): void {
    const specFile = join(changeDir, 'specs', name, 'spec.md');
    if (!existsSync(specFile)) return;
  
    const deltaContent = readFileSync(specFile, 'utf-8');
    const delta = parseDeltaSpec(deltaContent);
  
    // Parse existing living spec or create empty
    const livingSpecDir = join(getSpecsDir(), name);
    mkdirSync(livingSpecDir, { recursive: true });
    const livingSpecFile = join(livingSpecDir, 'spec.md');
    
    let living: any;
    if (existsSync(livingSpecFile)) {
      living = parseSpec(readFileSync(livingSpecFile, 'utf-8'));
    } else {
      living = { title: name, purpose: '', requirements: [], warnings: [], schemaVersion: 1 };
    }
  
    const merged = mergeSpecs(living, delta);
    
    // Format back to markdown
    const md = formatSpec(merged);
    writeFileSync(livingSpecFile, md, 'utf-8');
  }
  ```
  
  Run test: `npx vitest run tests/living-specs.test.ts`
  Expected: PASS

- [ ] **Step 3: Commit**
  
  ```bash
  git add -A && git commit -m "feat: merge delta spec into living specs on archive (living-specs)"
  ```

### Task 2: Auto version bump on archive

**Files:**
- Modify: `src/cli/commands/archive.ts`

- [ ] **Step 1: Write failing test**
  
  ```ts
  it('bumps version on archive', () => {
    // Archive a change
    // Check package.json version went from X.Y.Z to X.Y.Z+1
  });
  ```
  
  Run: `npx vitest run tests/living-specs.test.ts`
  Expected: FAIL

- [ ] **Step 2: Implement version bump**
  
  Add to archive.ts:
  ```ts
  function bumpVersion(): string {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const parts = pkg.version.split('.').map(Number);
    parts[2] += 1; // patch bump
    const newVersion = parts.join('.');
    pkg.version = newVersion;
    writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    return newVersion;
  }
  
  function createTag(version: string): void {
    execSync(`git tag v${version}`, { stdio: 'pipe' });
  }
  ```
  
  Run test: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add -A && git commit -m "feat: auto version bump + git tag on archive (auto-publish)"
  ```

### Task 3: Publish command

**Files:**
- Create: `src/cli/commands/publish.ts`
- Modify: `src/cli/index.ts`

- [ ] **Step 1: Create publish.ts**
  
  ```ts
  import { execSync } from 'child_process';
  import { readFileSync } from 'fs';
  import { join } from 'path';
  
  export function cmdPublish(options: { dryRun?: boolean }): void {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const version = pkg.version;
    
    console.log(`📦 @gotako/loomkit v${version}`);
    
    if (options.dryRun) {
      console.log('\n  🔍 Dry run — not publishing');
      console.log('  To publish: loomkit publish');
      return;
    }
    
    execSync('npm publish', { stdio: 'inherit' });
    execSync('git push --tags', { stdio: 'inherit' });
    
    console.log(`✓  Published v${version}`);
  }
  ```
  
  Manual test: `node dist/cli/index.js publish --dry-run` → shows preview

## Verification

- [ ] Archive with spec → living spec file created
- [ ] Archive again → spec merged (no duplicate)
- [ ] Version bumped + git tag created
- [ ] `publish --dry-run` shows preview
