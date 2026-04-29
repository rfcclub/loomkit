# Design: TDD Enforcement

## Approach
TDD enforcement is structural: task format mandates test references, traceability tracks scenario coverage, verify gate blocks archive. LoomKit doesn't run tests — it delegates to the configured test framework CLI and parses results.

## Traceability File Format
```yaml
# loomkit/changes/add-auth/.traceability.yaml
mappings:
  - scenario: auth-valid-credentials
    test: tests/auth.test.ts::test_valid_credentials
    status: pending | passing | failing
  - scenario: auth-invalid-credentials
    test: tests/auth.test.ts::test_invalid_credentials
    status: passing
```

## Supported Test Frameworks
| Framework | Test file pattern | Run command | Result parsing |
|-----------|-----------------|------------|----------------|
| vitest | `**/*.test.ts` | `vitest run --reporter=json` | JSON stdout |
| jest | `**/*.test.ts` | `jest --json` | JSON stdout |
| pytest | `test_*.py` | `pytest --json-report` | JSON report file |
| xunit | `*Tests.cs` | `dotnet test --logger json` | TRX/JSON |
| custom | configurable | `tdd.command` | exit code 0/1 |

## Coverage Calculation
```
mandatory_scenarios = scenarios where requirement uses SHALL or MUST
covered = mandatory scenarios with test mapping status = "passing"
coverage = covered / mandatory_scenarios
passes = coverage >= threshold
```

SHOULD scenarios: tracked but excluded from threshold.

## File Layout
```
loomkit/src/tdd/
  traceability.ts    — .traceability.yaml read/write/query
  coverage.ts         — scenario coverage calculation
  frameworks.ts       — framework config + command mapping
  enforcement.ts      — TDD enforcement checks (task format, no-test validation)
```

## Rollback
Traceability file can be deleted and regenerated from spec + test files. No destructive operations.
