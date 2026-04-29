## CI Workflows

### Task 1: PR verify workflow

**Files:**
- Create: `.github/workflows/verify.yml`

- [ ] **Step 1: Create verify.yml**
  
  ```yaml
  name: LoomKit Verify
  on:
    pull_request:
      branches: [master]
  
  jobs:
    verify:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: pnpm
        - run: corepack enable pnpm
        - run: pnpm install
        - run: pnpm build
        - run: node dist/cli/index.js verify
  ```
  
  Commit: `git add -A && git commit -m "feat: add PR verify workflow (ci-verify)"`

### Task 2: Release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create release.yml**
  
  ```yaml
  name: LoomKit Release
  on:
    push:
      branches: [master]
  
  jobs:
    release:
      if: "!contains(github.event.head_commit.message, '[skip release]')"
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 22
            cache: pnpm
            registry-url: https://registry.npmjs.org
        - run: corepack enable pnpm
        - run: pnpm install
        - run: pnpm build
        - run: npm publish
          env:
            NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```
  
  Commit: `git add -A && git commit -m "feat: add release workflow (ci-release)"`

## Verification

- [ ] Verify workflow runs on PR (push a test PR)
- [ ] Release workflow skips with `[skip release]`
