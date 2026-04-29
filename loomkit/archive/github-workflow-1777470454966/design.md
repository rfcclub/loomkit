## Architecture

Two independent GitHub Action workflows that share no state.

### Workflow 1: Verify (`.github/workflows/verify.yml`)
- Trigger: `pull_request` to master
- Steps: checkout → setup Node → pnpm install → pnpm build → `loomkit verify`
- Matrix: single Node version (latest LTS)
- Gate: if verify fails, status check shows ❌

### Workflow 2: Release (`.github/workflows/release.yml`)
- Trigger: `push` to master (after archive merges)
- Steps: checkout → setup Node → pnpm install → pnpm build → npm publish
- Condition: skip if commit contains `[skip release]`
- Version: manual bump via commit (no auto-version)

## Components

| File | Purpose |
|------|---------|
| `.github/workflows/verify.yml` | PR coverage gate |
| `.github/workflows/release.yml` | Auto-publish on master push |

## Test Strategy

| Scenario ID | Test | Type |
|-------------|------|------|
| PR with passing coverage | Manual: create PR with full coverage | Manual |
| PR with failing coverage | Manual: create PR with missing tests | Manual |
| Archive triggers release | Manual: merge archive → check npm | Manual |
| Manual release skip | Manual: commit with [skip release] | Manual |

These workflows are CI configuration, not code — testing is manual verification.

## Risks / Trade-offs

- CI workflow runs on GitHub infra — no local repro needed
- npm token stored as GitHub secret (`NPM_TOKEN`)
- Release workflow uses the same token from `.npmrc`
- If npm publish fails, release still pushes (can retry manually)
