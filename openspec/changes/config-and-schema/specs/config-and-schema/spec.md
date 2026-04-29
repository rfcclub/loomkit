# Config & Schema System Specification

## Purpose
Defines LoomKit's configuration format and schema system. Config drives project context, TDD settings, and per-artifact rules. Schema defines the artifact workflow (what artifacts exist, their templates, instructions, and dependencies).

## Requirements

### Requirement: Config file location
LoomKit SHALL look for `loomkit/config.yaml` in the project root. If not found, use defaults.

#### Scenario: Config found
- **WHEN** `loomkit/config.yaml` exists
- **THEN** LoomKit loads and validates it

#### Scenario: Config not found
- **WHEN** `loomkit/config.yaml` does not exist
- **THEN** LoomKit uses defaults and logs info "no config found, using defaults"

### Requirement: No required fields
All config fields SHALL have sensible defaults.

#### Scenario: Empty config
- **WHEN** `loomkit/config.yaml` is `{}`
- **THEN** defaults: schema=spec-driven, tdd.framework=vitest, tdd.enforce=true, tdd.coverage_threshold=100

### Requirement: TDD config
`tdd` section SHALL support: `framework` (enum), `enforce` (boolean), `coverage_threshold` (0-100), `command` (optional string).

#### Scenario: Custom threshold
- **WHEN** `tdd.coverage_threshold` is 80
- **THEN** verify passes at ≥80%

#### Scenario: Invalid threshold
- **WHEN** `tdd.coverage_threshold` is 150
- **THEN** LoomKit SHALL error "coverage_threshold must be 0-100"

### Requirement: Context injection
`context` field SHALL be injected into all artifact instructions.

#### Scenario: Context in artifact
- **WHEN** `context` is "Stack: TypeScript, React"
- **THEN** all artifact templates include this context

### Requirement: Per-artifact rules
`rules` section SHALL define per-artifact validation rules keyed by artifact ID.

#### Scenario: Spec rule
- **WHEN** `rules.specs` includes "Every requirement needs ≥1 scenario"
- **THEN** spec generation prompts for scenarios

### Requirement: Env var substitution
Config values SHALL support `${ENV_VAR}` syntax.

#### Scenario: Env var resolved
- **WHEN** `tdd.command` is `${CUSTOM_TEST_CMD}`
- **THEN** value of `CUSTOM_TEST_CMD` env var is used

#### Scenario: Env var not set
- **WHEN** `${CUSTOM_TEST_CMD}` referenced but not set
- **THEN** LoomKit SHALL error "environment variable CUSTOM_TEST_CMD not set"

### Requirement: Schema artifact definitions
Schema SHALL define artifacts with: id, generates (file pattern), description, template, instruction, requires (dependency artifacts).

#### Scenario: Artifact with dependency
- **WHEN** schema defines `specs` artifact with `requires: [proposal]`
- **THEN** specs cannot be generated until proposal exists

### Requirement: Schema templates
Each artifact SHALL have a markdown template file that seeds the generated artifact.

#### Scenario: Template used
- **WHEN** generating a spec artifact
- **THEN** the template from `schemas/spec-driven/templates/spec.md` is used as starting content

### Requirement: Config validation on load
LoomKit SHALL validate config on load and report errors before any operation.

#### Scenario: Invalid framework
- **WHEN** `tdd.framework` is "unknown"
- **THEN** LoomKit SHALL error "unsupported framework: unknown (supported: vitest, jest, pytest, xunit, custom)"
