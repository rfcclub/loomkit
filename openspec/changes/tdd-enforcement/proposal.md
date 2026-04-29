# Proposal: TDD Enforcement

## Motivation
From Superpowers: the Iron Law — no production code without a failing test first. LoomKit enforces TDD through structured task format, traceability mapping, and a verify gate that blocks archive if tests don't pass.

## Scope
- TDD cycle enforcement per task (RED → GREEN → REFACTOR → VERIFY)
- Traceability: scenario → test mapping
- Test framework configuration
- Coverage threshold enforcement
- [no-test] exception handling

## Non-goals
- Running tests (delegate to test framework CLI)
- Test code generation from specs (future)
- CI/CD integration

## Source
- TDD Iron Law: ~/repo/superpowers/skills/test-driven-development/SKILL.md
- Verification: ~/repo/superpowers/skills/verification-before-completion/SKILL.md
