# TDD Enforcement Specification

## Purpose
Ensures every implementation follows test-driven development: test first, code second, verify always. The Iron Law from Superpowers, enforced structurally by LoomKit.

## Requirements

### Requirement: Traceability mapping
LoomKit SHALL maintain a mapping from each spec scenario to its test implementation in `.traceability.yaml`.

#### Scenario: Mapping created on test write
- **WHEN** a test is written for scenario `auth-valid-credentials`
- **THEN** `.traceability.yaml` records `{scenario: auth-valid-credentials, test: tests/auth.test.ts::test_valid_credentials, status: pending}`

#### Scenario: Uncovered scenario detected
- **WHEN** `/lk:verify` runs and scenario `auth-invalid-credentials` has no test mapping
- **THEN** verify reports "uncovered scenario: auth-invalid-credentials"

### Requirement: Test framework configuration
LoomKit SHALL read test framework from `loomkit/config.yaml` under `tdd.framework`.

#### Scenario: Vitest configured
- **WHEN** `tdd.framework` is "vitest"
- **THEN** LoomKit expects test files matching `**/*.test.ts` and uses `vitest run` for verification

#### Scenario: Custom framework
- **WHEN** `tdd.framework` is "custom" and `tdd.command` is "my-runner"
- **THEN** LoomKit uses `my-runner` for verification

#### Scenario: Unknown framework
- **WHEN** `tdd.framework` is "unknown-thing"
- **THEN** LoomKit SHALL error "unsupported test framework: unknown-thing"

### Requirement: Coverage threshold
LoomKit SHALL enforce coverage threshold from `tdd.coverage_threshold`. Only SHALL/MUST scenarios count toward threshold.

#### Scenario: Below threshold
- **WHEN** 8/10 mandatory scenarios have passing tests (80%) and threshold is 100%
- **THEN** verify SHALL fail with "coverage 80% < threshold 100%"

#### Scenario: SHOULD excluded from threshold
- **WHEN** a SHOULD scenario has no test
- **THEN** it SHALL NOT count against threshold (warn only)

#### Scenario: At threshold
- **WHEN** all mandatory scenarios have passing tests
- **THEN** verify passes

### Requirement: No-test exception
Tasks MAY be marked `[no-test: <reason>]` to skip TDD requirement.

#### Scenario: Valid no-test
- **WHEN** a task is `- [ ] 2.3 Update README [no-test: documentation only]`
- **THEN** the task may be completed without a test

#### Scenario: No-test without reason
- **WHEN** a task is marked `[no-test]` without a reason string
- **THEN** LoomKit SHALL warn "[no-test] requires a reason"

### Requirement: TDD enforcement toggle
When `tdd.enforce` is false, LoomKit SHALL skip TDD cycle checks and verify gate.

#### Scenario: Enforcement disabled
- **WHEN** `tdd.enforce` is false
- **THEN** archive is allowed without verify, tasks don't require test references

#### Scenario: Enforcement enabled (default)
- **WHEN** `tdd.enforce` is true
- **THEN** all TDD checks are active
