## ADDED Requirements

### Requirement: Archive merges delta into living specs
The system SHALL merge delta spec into `loomkit/specs/<capability>/spec.md` on archive.

#### Scenario: Archive with no existing living spec
- **WHEN** archive runs and `loomkit/specs/<capability>/spec.md` does not exist
- **THEN** the change's delta spec is saved as the initial living spec

#### Scenario: Archive with existing living spec
- **WHEN** archive runs and `loomkit/specs/<capability>/spec.md` already exists
- **THEN** delta spec is merged into existing living spec via `mergeSpecs()`
- **AND** ADDED requirements are appended
- **AND** MODIFIED requirements are replaced
- **AND** REMOVED requirements are removed

### Requirement: Auto version bump on archive
The system SHALL bump package.json `version` field on archive (patch increment).

#### Scenario: Archive bumps version
- **WHEN** archive runs successfully
- **THEN** package.json version patch is incremented (1.0.0 → 1.0.1)
- **AND** git tag `v1.0.1` is created

### Requirement: Publish to npm
The system SHOULD support `loomkit publish` to push the current version to npm.

#### Scenario: Publish dry-run
- **WHEN** `loomkit publish --dry-run` runs
- **THEN** package is packed but not published
- **AND** preview of version + changes is shown

#### Scenario: Publish live
- **WHEN** `loomkit publish` runs
- **THEN** `npm publish` is executed
- **AND** `git push --tags` is executed
- **AND** existing specs are not modified

## REMOVED Requirements

None.

## RENAMED Requirements

None.
