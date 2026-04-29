# Proposal: Spec Format — Requirements-as-Code

## Motivation
Core artifact format from OpenSpec: structured requirements with WHEN/THEN scenarios that LLMs read and translate to test cases. LoomKit extends OpenSpec's format with typed assertions and scenario IDs for traceability.

## Scope
- WHEN/THEN scenario format with typed assertions (=, !=, contains, matches, >, <, is a)
- Requirement → scenario → test case mapping contract
- Scenario IDs for traceability
- Delta spec operations (ADDED/MODIFIED/REMOVED/RENAMED)
- RFC 2119 strength keywords (SHALL/MUST/SHOULD/MAY)
- Schema versioning

## Non-goals
- Auto-generating test code from specs (future)
- Visual spec editors
- BDD framework integration (Cucumber etc.)

## Source
- Format: ~/repo/OpenSpec/schemas/spec-driven/schema.yaml + templates/spec.md
- Delta ops: ~/repo/OpenSpec/src/core/specs-apply.ts (ADDED/MODIFIED/REMOVED/RENAMED)
