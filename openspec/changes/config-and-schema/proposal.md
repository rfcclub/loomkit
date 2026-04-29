# Proposal: Config & Schema System

## Motivation
From OpenSpec: config.yaml drives project context, per-artifact rules, and schema selection. The schema system defines artifacts (proposal, specs, design, tasks) with templates and instructions. LoomKit adds TDD config on top.

## Scope
- `loomkit/config.yaml` format with TDD section
- Schema system: artifact definitions with templates + instructions (from OpenSpec)
- Config loading with env var substitution
- Config validation with defaults

## Non-goals
- Hot-reload of config
- UI for config editing
- Multiple schema support (only spec-driven for now)

## Source
- Config: ~/repo/OpenSpec/src/core/config.ts + config-schema.ts
- Schema system: ~/repo/OpenSpec/schemas/spec-driven/schema.yaml
