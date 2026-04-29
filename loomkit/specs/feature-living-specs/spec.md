# feature-living-specs Specification

## Requirements

### Requirement: Archive merges delta into living specs

The system SHALL merge delta spec into `loomkit/specs/<capability>/spec.md` on archive.

#### Scenario: Merges Delta Into Living Specs Archive With No Existing Living Spec

- **WHEN** archive runs and `loomkit/specs/<capability>/spec.md` does not exist
- **THEN** the change's delta spec is saved as the initial living spec

#### Scenario: Merges Delta Into Living Specs Archive With Existing Living Spec

- **WHEN** archive runs and `loomkit/specs/<capability>/spec.md` already exists
- **THEN** delta spec is merged into existing living spec via `mergeSpecs()`
- **THEN** ADDED requirements are appended
- **THEN** MODIFIED requirements are replaced
- **THEN** REMOVED requirements are removed

### Requirement: Auto version bump on archive

The system SHALL bump package.json `version` field on archive (patch increment).

#### Scenario: Version Bump On Archive Archive Bumps Version

- **WHEN** archive runs successfully
- **THEN** package.json version patch is incremented (1.0.0 → 1.0.1)
- **THEN** git tag `v1.0.1` is created

### Requirement: Publish to npm

The system SHOULD support `loomkit publish` to push the current version to npm.

#### Scenario: To Npm Publish Dry Run

- **WHEN** `loomkit publish --dry-run` runs
- **THEN** package is packed but not published
- **THEN** preview of version + changes is shown

#### Scenario: To Npm Publish Live

- **WHEN** `loomkit publish` runs
- **THEN** `npm publish` is executed
- **THEN** `git push --tags` is executed
- **THEN** existing specs are not modified
