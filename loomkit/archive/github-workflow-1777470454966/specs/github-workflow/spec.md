## ADDED Requirements

### Requirement: PR verify gate
The system SHALL run `loomkit verify` on every PR and block merge if coverage < 100%.

#### Scenario: PR with passing coverage
- **WHEN** a PR has all scenarios covered (coverage = 100%)
- **THEN** verify.yml exits with code 0
- **AND** PR check shows green

#### Scenario: PR with failing coverage
- **WHEN** a PR has uncovered scenarios (coverage < 100%)
- **THEN** verify.yml exits with code 1
- **AND** PR check shows red

### Requirement: Release on archive
The system SHOULD publish a new npm version when a change is archived to master.

#### Scenario: Archive triggers release
- **WHEN** a change is archived to master branch
- **THEN** release.yml builds and publishes `@gotako/loomkit`
- **AND** GitHub Release is created with version bump

#### Scenario: Manual release skip
- **WHEN** commit message contains `[skip release]`
- **THEN** release.yml is not triggered

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
