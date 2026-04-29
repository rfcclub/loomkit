# Brainstorm & Plan Specification

## Purpose
Defines LoomKit's brainstorm and plan phases — the critical "before coding" workflow from Superpowers that ensures specs and plans are thorough, TDD-ready, and free of ambiguity.

## Requirements

### Requirement: Brainstorm explores context first
Brainstorm SHALL examine project files, docs, and recent commits before asking any questions.

#### Scenario: Context loaded before questions
- **WHEN** `/lk:brainstorm` is invoked
- **THEN** LoomKit reads project structure, existing specs, and recent changes before the first question

### Requirement: One question at a time
Brainstorm SHALL ask clarifying questions one at a time, not multiple questions per message.

#### Scenario: Single question
- **WHEN** brainstorm needs to understand purpose and constraints
- **THEN** it asks about purpose first, waits for answer, then asks about constraints

### Requirement: Propose 2-3 approaches
Brainstorm SHALL propose 2-3 approaches with trade-offs and a recommendation before settling on one.

#### Scenario: Multiple approaches presented
- **WHEN** the idea is understood
- **THEN** LoomKit presents at least 2 approaches with pros/cons and marks one as recommended

### Requirement: Design presented in sections
Brainstorm SHALL present the design section-by-section, getting approval after each section.

#### Scenario: Section-by-section approval
- **WHEN** design has architecture, components, and data flow sections
- **THEN** each section is presented separately, user approves before next

### Requirement: Brainstorm writes proposal
When design is approved, brainstorm SHALL write proposal.md following OpenSpec's proposal template.

#### Scenario: Proposal written
- **WHEN** user approves all design sections
- **THEN** proposal.md is written to `loomkit/changes/<name>/proposal.md`

### Requirement: Plan tasks are bite-sized
Each task step SHALL be completable in 2-5 minutes. One action per step.

#### Scenario: Bite-sized step
- **WHEN** a plan step is "Write failing test for user email validation"
- **THEN** it contains: exact test code, file path, and expected failure output

#### Scenario: Step too large
- **WHEN** a plan step describes multiple actions
- **THEN** validation SHALL warn "step too large, break into separate steps"

### Requirement: Plan includes exact code
Every code step SHALL contain the complete code an engineer needs — no placeholders, no TBD, no "implement later".

#### Scenario: Step with exact code
- **WHEN** a plan step says "Write failing test"
- **THEN** it includes the complete test function code in a code block

#### Scenario: Placeholder detected
- **WHEN** a plan step contains "TBD", "TODO", "implement later", "fill in details"
- **THEN** validation SHALL fail with "placeholder detected in step X.Y, replace with actual code"

#### Scenario: Vague instruction detected
- **WHEN** a plan step says "add appropriate error handling" or "handle edge cases" without showing code
- **THEN** validation SHALL fail with "vague instruction, show exact code"

### Requirement: Plan follows TDD cycle
Each implementation task SHALL follow: write failing test → verify fail → implement → verify pass → commit.

#### Scenario: TDD step structure
- **WHEN** a plan task implements a feature
- **THEN** its steps follow: Step N: Write failing test (code) → Step N+1: Run test, verify FAIL → Step N+2: Implement (code) → Step N+3: Run test, verify PASS → Step N+4: Commit

#### Scenario: Code written before test
- **WHEN** a plan step writes implementation code before writing a test
- **THEN** validation SHALL fail with "implementation before test — reorder to write test first"

### Requirement: Plan self-review
After writing the complete plan, LoomKit SHALL self-review: spec coverage, placeholder scan, type consistency.

#### Scenario: Spec coverage check
- **WHEN** self-review runs
- **THEN** LoomKit verifies every spec requirement has at least one plan task

#### Scenario: Missing spec coverage
- **WHEN** a spec requirement has no corresponding plan task
- **THEN** LoomKit adds a task for that requirement

#### Scenario: Type consistency check
- **WHEN** a function is called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7
- **THEN** self-review SHALL flag the inconsistency

### Requirement: No duplicate code across tasks
Each task SHALL contain complete code even if similar to another task (from Superpowers: engineer may read tasks out of order).

#### Scenario: "Similar to Task N" detected
- **WHEN** a plan step says "similar to Task 3" or "same pattern as above"
- **THEN** validation SHALL fail with "repeat the code, do not reference other tasks"

### Requirement: Exact file paths
Every step SHALL specify the exact file path for files created or modified.

#### Scenario: File path specified
- **WHEN** a step creates a new test file
- **THEN** the step includes `Create: tests/auth.test.ts`

#### Scenario: File path missing
- **WHEN** a step modifies code but doesn't specify which file
- **THEN** validation SHALL fail with "step missing file path"
