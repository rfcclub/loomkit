# Verify & Archive Specification

## Purpose
Verification gate and archive workflow. Verify checks that all mandatory spec scenarios have passing tests. Archive merges change specs into living specs, gated by verify.

## Requirements

### Requirement: Verify checks scenario coverage
`/lk:verify` SHALL check that all SHALL/MUST scenarios have passing test mappings.

#### Scenario: Full coverage
- **WHEN** all mandatory scenarios have passing test mappings
- **THEN** verify outputs "✓ 100% scenario coverage" and exits 0

#### Scenario: Partial coverage
- **WHEN** 7/10 mandatory scenarios have passing tests
- **THEN** verify outputs "✗ 70% scenario coverage (threshold: 100%)" and lists 3 uncovered scenarios, exits 1

### Requirement: Verify runs test suite
`/lk:verify` SHALL run the configured test framework and parse results.

#### Scenario: All tests pass
- **WHEN** test framework exits 0
- **THEN** verify marks all mapped scenarios as "passing"

#### Scenario: Tests fail
- **WHEN** 2 tests fail
- **THEN** verify marks those scenarios as "failing" in traceability

### Requirement: Verify writes status file
Verify SHALL write `.loomkit-verify.json` with timestamp, coverage, and per-scenario status.

#### Scenario: Status file written
- **WHEN** verify completes
- **THEN** `.loomkit-verify.json` contains `{timestamp, coverage, threshold, passed, scenarios: {name: status}}`

### Requirement: Verify reports per-scenario
`/lk:verify` SHALL output a table: scenario | test | status.

#### Scenario: Mixed results
- **WHEN** 8 passing and 2 failing scenarios
- **THEN** output lists each scenario with ✓ or ✗ and its test file

### Requirement: Archive blocked without verify
`/lk:archive` SHALL refuse if verify has not passed.

#### Scenario: No verify run
- **WHEN** archive called and `.loomkit-verify.json` doesn't exist
- **THEN** archive SHALL refuse with "run /lk:verify first"

#### Scenario: Verify failed
- **WHEN** `.loomkit-verify.json` shows passed=false
- **THEN** archive SHALL refuse with "scenario coverage below threshold"

#### Scenario: Verify passed
- **WHEN** `.loomkit-verify.json` shows passed=true
- **THEN** archive proceeds

### Requirement: Force archive with reason
`/lk:archive --force --reason "..."` SHALL override verify gate.

#### Scenario: Force with reason
- **WHEN** `lk:archive add-auth --force --reason "hotfix, tests follow"`
- **THEN** archive proceeds, reason recorded in archive metadata

#### Scenario: Force without reason
- **WHEN** `lk:archive add-auth --force` without --reason
- **THEN** archive SHALL refuse with "--force requires --reason"

### Requirement: Spec merge on archive (from OpenSpec)
When archiving, change specs SHALL merge into `loomkit/specs/` using delta operations.

#### Scenario: New spec merged (ADDED)
- **WHEN** change has spec `auth/spec.md` not in living specs
- **THEN** spec is copied to `loomkit/specs/auth/spec.md`

#### Scenario: Modified spec merged (MODIFIED)
- **WHEN** change has delta spec modifying existing `auth/spec.md`
- **THEN** the delta operations (ADDED/MODIFIED/REMOVED/RENAMED) are applied to the living spec

#### Scenario: Existing spec replaced (no delta)
- **WHEN** change has full spec `auth/spec.md` and living spec exists
- **THEN** the change version overwrites the living spec

### Requirement: Archive metadata
Archive SHALL write metadata with timestamp, coverage, forced status, spec/requirement/scenario counts.

#### Scenario: Metadata recorded
- **WHEN** archive completes
- **THEN** `loomkit/archive/<date>-<name>/.loomkit-archive.json` is written
