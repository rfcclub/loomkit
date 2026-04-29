## Why

LoomKit needs CI automation so humans don't have to manually run verify before merging. A GitHub Action ensures every change passes coverage gate before PR can merge.

## What Changes

- Add `.github/workflows/verify.yml` — runs `loomkit verify` on every PR
- Add `.github/workflows/release.yml` — publishes new version on archive

## Capabilities

### New Capabilities
- `ci-verify`: Automated coverage check on PR — blocks merge if verify fails
- `ci-release`: Auto-publish to npm when a change is archived to master

### Modified Capabilities
- None

## Non-Goals

- Not modifying the verify logic itself
- Not adding CodeCov or external coverage services
- Not adding npm publishing more complex than `npm publish`
