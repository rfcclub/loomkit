# Proposal: Verify & Archive

## Motivation
From OpenSpec: archive merges change specs into living specs. LoomKit adds a TDD verification gate — archive is blocked until all mandatory scenarios have passing tests. This is the enforcement mechanism that makes TDD real, not just suggested.

## Scope
- `/lk:verify` — run test framework, check scenario coverage, write verify status
- `/lk:archive` — gate on verify pass, merge specs, move change to archive
- Force archive with reason

## Non-goals
- CI/CD hooks
- Performance benchmarks
- Code coverage (line/branch) — LoomKit tracks scenario coverage

## Source
- Archive + spec merge: ~/repo/OpenSpec/src/core/specs-apply.ts + src/commands/archive.ts
- Verification: ~/repo/superpowers/skills/verification-before-completion/SKILL.md
