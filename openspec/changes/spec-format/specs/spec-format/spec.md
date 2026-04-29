# Spec Format — Requirements-as-Code Specification

## Purpose
Defines the markdown format for LoomKit specs: structured requirements with testable WHEN/THEN scenarios, delta operations, and RFC 2119 strength classification. Directly ported from OpenSpec's spec-driven schema with LoomKit additions (typed assertions, scenario IDs).

## Requirements

### Requirement: Spec file structure
A spec file SHALL contain `# <Name> Specification`, `## Purpose`, and `## Requirements` sections.

#### Scenario: Valid spec structure
- **WHEN** a spec file has title, purpose, and requirements sections
- **THEN** the spec is structurally valid

#### Scenario: Missing purpose section
- **WHEN** a spec file has no `## Purpose` section
- **THEN** validation SHALL fail with "spec missing required section: Purpose"

### Requirement: Requirement structure
Each requirement SHALL have a title (`### Requirement: <name>`) and a description using RFC 2119 keywords (SHALL/MUST/SHOULD/MAY).

#### Scenario: Requirement with SHALL
- **WHEN** a requirement states "The system SHALL issue a JWT"
- **THEN** the requirement is mandatory and must have passing tests to archive

#### Scenario: Requirement with SHOULD
- **WHEN** a requirement states "The system SHOULD cache responses"
- **THEN** the requirement is recommended but not blocking for archive

#### Scenario: Requirement without RFC 2119 keyword
- **WHEN** a requirement states "The system issues a JWT" (no SHALL/MUST)
- **THEN** validation SHALL warn "requirement lacks RFC 2119 keyword, treating as SHALL"

### Requirement: Scenario format
Each scenario SHALL use WHEN/THEN format. WHEN describes precondition/input. THEN describes expected outcome with typed assertions.

#### Scenario: Scenario with typed assertion
- **WHEN** a scenario specifies `THEN response.status = 200`
- **THEN** the assertion is parseable: target="response.status", operator="=", expected="200"

#### Scenario: Multiple THEN clauses
- **WHEN** a scenario has `THEN response.status = 200` AND `THEN response.body.token is a valid JWT`
- **THEN** both assertions are captured as separate test assertions

#### Scenario: Scenario without THEN
- **WHEN** a scenario has WHEN but no THEN
- **THEN** validation SHALL fail with "scenario missing THEN clause"

### Requirement: Assertion operators
Assertions SHALL support: `=`, `!=`, `contains`, `matches`, `is a`, `>`, `<`.

#### Scenario: Equality assertion
- **WHEN** `THEN result = true`
- **THEN** parsed as operator `=`, expected `true`

#### Scenario: Contains assertion
- **WHEN** `THEN response.body.roles contains "admin"`
- **THEN** parsed as operator `contains`, expected `"admin"`

#### Scenario: Regex assertion
- **WHEN** `THEN response.body.token matches /^eyJ/`
- **THEN** parsed as operator `matches`, expected `^eyJ`

### Requirement: AND chaining
Scenarios SHALL support AND to chain conditions and assertions. OR is NOT supported — split into separate scenarios.

#### Scenario: Chained preconditions
- **WHEN** a scenario has `WHEN user logs in` AND `AND user has 2FA enabled`
- **THEN** both conditions must be satisfied before THEN is evaluated

#### Scenario: OR in scenario
- **WHEN** a scenario uses `OR` in WHEN or THEN
- **THEN** validation SHALL fail with "OR not supported, split into separate scenarios"

### Requirement: Scenario ID
Each scenario SHALL have a unique identifier within the spec for traceability to tests.

#### Scenario: Auto-generated ID
- **WHEN** a scenario is written without explicit ID
- **THEN** LoomKit generates ID from requirement name + scenario index (e.g., `auth-valid-credentials`)

### Requirement: Delta spec operations
Delta specs SHALL support ADDED, MODIFIED, REMOVED, RENAMED operations (from OpenSpec).

#### Scenario: ADDED requirements
- **WHEN** a delta spec has `## ADDED Requirements` section
- **THEN** those requirements are new and will be appended to the living spec

#### Scenario: MODIFIED requirements
- **WHEN** a delta spec has `## MODIFIED Requirements` section
- **THEN** those requirements replace the matching requirement in the living spec (name must match exactly)

#### Scenario: REMOVED requirements
- **WHEN** a delta spec has `## REMOVED Requirements` section
- **THEN** each MUST include `**Reason**` and `**Migration**` fields

#### Scenario: RENAMED requirements
- **WHEN** a delta spec has `## RENAMED Requirements` section
- **THEN** each uses `FROM: <old>` / `TO: <new>` format

### Requirement: Schema versioning
Spec files SHALL support `schema_version` field (default: 1). LoomKit SHALL warn when processing specs with newer versions.

#### Scenario: Unsupported version
- **WHEN** a spec has `schema_version: 2` and LoomKit supports max 1
- **THEN** LoomKit SHALL warn "spec uses schema v2, LoomKit supports up to v1"
