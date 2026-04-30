# Test CI Verify Workflow

This file is created to test the GitHub Actions verify workflow.

## Purpose

- Trigger pull_request event
- Verify that `pnpm build` and `loomkit verify` run successfully in CI
- Confirm CI/CD pipeline is working

## Expected Behavior

1. GitHub Actions should trigger on PR creation
2. `actions/setup-node@v4` with pnpm cache
3. `pnpm install --frozen-lockfile` should install dependencies
4. `pnpm build` should compile TypeScript
5. `node dist/cli/index.js verify` should run coverage gate

## Cleanup

This file should be deleted after CI verification.
