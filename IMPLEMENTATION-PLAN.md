# LoomKit Implementation Plan

## Overview

Giao cho agent thực hiện từng phase. Mỗi phase có deliverable rõ ràng, test được, review được.

**Current state:** 65 tests passing (src/ validation tool), design doc done, no SKILL.md, no adapters, tsc build broken (Zod v4 API).

**Target:** Full LoomKit framework — SKILL.md skills + validation tool + adapters + CLI.

---

## Phase 0: Fix Build (prerequisite)

**Owner:** any agent
**Estimate:** 30 min
**Deliverable:** `npx tsc` passes with 0 errors

### Steps

1. Fix `src/config/loader.ts` — Zod v4 API changes:
   - `z.record(z.array(z.string()))` → `z.record(z.string(), z.array(z.string()))`
   - `TddConfigSchema.optional()` type issue — use explicit typing or `.nullable()`
   - `process` type — add `@types/node` to tsconfig types field (already in devDeps)
2. Run `npx tsc` — verify 0 errors
3. Run `npx vitest run` — verify 65 tests still green
4. Commit: `fix: tsc build errors (Zod v4 API compat)`

**Verify:** `npx tsc && npx vitest run` both pass

---

## Phase 1: SKILL.md Files (core product)

**Owner:** agent with good writing skills (Claude Code preferred)
**Estimate:** 2-3 hours
**Deliverable:** 7 SKILL.md files in `skills/`, each followable by any agent

### Structure
```
skills/
├── brainstorm/SKILL.md
├── spec/SKILL.md
├── design/SKILL.md
├── plan/SKILL.md
├── tdd/SKILL.md
├── verify/SKILL.md
└── archive/SKILL.md
```

### Per-SKILL.md Template

Every SKILL.md must have:
```markdown
---
name: <phase-name>
description: Use when <trigger condition>
---

# <Phase Name>

## Overview
<1-2 sentences what this phase does>

## When to Use
<trigger conditions>

## Instructions
<step-by-step, agent can follow without asking questions>

## Output
<exact file(s) produced, format specification>

## Validation
<how to check output is correct — reference to src/ validator if exists>

## Anti-Patterns
<what NOT to do, common mistakes>
```

### Skill 1: brainstorm/SKILL.md

**Source:** `~/repo/superpowers/skills/brainstorming/SKILL.md`
**Must include:**
- Socratic dialogue — one question at a time
- Explore: problem, constraints, existing solutions
- Generate 2-3 approaches minimum
- Present each approach with: idea, trade-offs, risks
- Output: `proposal.md` (motivation, what changes, capabilities, non-goals)

### Skill 2: spec/SKILL.md

**Source:** OpenSpec spec format + `src/spec/parser.ts`
**Must include:**
- Write `### Requirement:` with RFC 2119 keyword (SHALL/MUST/SHOULD)
- Write `#### Scenario:` with WHEN/THEN format
- No OR in scenarios (split into separate scenarios)
- Multiple AND clauses OK
- Output: `specs/<name>/spec.md`

### Skill 3: design/SKILL.md

**Source:** `~/repo/superpowers/skills/writing-plans/SKILL.md` (design section)
**Must include:**
- Architecture decisions + rationale
- Test strategy section (map scenarios → test files)
- File structure changes
- Data model changes (if any)
- Output: `design.md`

### Skill 4: plan/SKILL.md

**Source:** `~/repo/superpowers/skills/writing-plans/SKILL.md`
**Must include:**
- Each Task has: **Files** section (Create/Modify/Test + paths)
- Each Step is bite-sized (2-5 min)
- Every step has exact code (no placeholders, no TBD, no "implement later")
- TDD cycle: write failing test → verify fail → implement → verify pass → commit
- No cross-task references ("similar to Task 1" = banned)
- Output: `tasks.md`

### Skill 5: tdd/SKILL.md

**Source:** `~/repo/superpowers/skills/test-driven-development/SKILL.md`
**Must include:**
- Iron Law: no code without failing test
- RED/GREEN/REFACTOR cycle
- If code written before test → delete code, write test first
- Traceability: map scenario ID → test file
- Output: code + tests (implementation), `.traceability.yaml`

### Skill 6: verify/SKILL.md

**Source:** `src/verify/verify.ts` + `src/tdd/traceability.ts`
**Must include:**
- Check scenario coverage (mandatory scenarios = SHALL/MUST only)
- Run test suite
- Generate coverage report per scenario
- Output: `.loomkit-verify.json`

### Skill 7: archive/SKILL.md

**Source:** `src/archive/archive.ts` + OpenSpec archive workflow
**Must include:**
- Gate: verify must pass (or force with reason)
- Delta spec → living spec merge
- Archive metadata
- Output: merged specs in `specs/`, metadata in `archive/`

**Verify:** each SKILL.md is complete, followable without external references

---

## Phase 2: Adapters

**Owner:** agent familiar with both Claude Code and Codex
**Estimate:** 1-2 hours
**Deliverable:** 2 adapter directories, generated instruction files

### Adapter Structure
```
adapters/
├── claude-code/
│   ├── CLAUDE.md              # project-level instructions
│   ├── generate-skills.sh     # copy SKILL.md → ~/.claude/skills/loomkit-*
│   └── README.md               # setup instructions for human
├── codex/
│   ├── AGENTS.md              # project-level instructions (Codex format)
│   ├── generate-instructions.sh # convert SKILL.md → AGENTS.md fragments
│   └── README.md
├── claude-cowork/             # (future — placeholder only)
│   └── README.md
└── codex-app/                 # (future — placeholder only)
    └── README.md
```

### Claude Code Adapter

1. Write `adapters/claude-code/CLAUDE.md` — project-level instructions that:
   - Reference LoomKit skills
   - Set TDD enforcement rules
   - Define workflow commands (`/lk:brainstorm`, `/lk:spec`, etc.)
2. Write `adapters/claude-code/generate-skills.sh`:
   - Reads each `skills/*/SKILL.md`
   - Copies to `~/.claude/skills/loomkit-<phase>/SKILL.md`
3. Write `adapters/claude-code/README.md` — setup steps for human

### Codex Adapter

1. Write `adapters/codex/AGENTS.md` — equivalent instructions in Codex format:
   - Different from CLAUDE.md (Codex uses different instruction conventions)
   - Reference same workflow, same artifacts
   - Adapt terminology (Codex uses "instructions" not "skills")
2. Write `adapters/codex/generate-instructions.sh`:
   - Convert SKILL.md → Codex-compatible instruction format
3. Write `adapters/codex/README.md`

### Future Adapters

1. `adapters/claude-cowork/README.md` — note: TBD, waiting for API/plugin docs
2. `adapters/codex-app/README.md` — note: TBD, waiting for app SDK docs

**Verify:** `generate-skills.sh` runs and populates `~/.claude/skills/loomkit-*`; CLAUDE.md + AGENTS.md are coherent with skills/

---

## Phase 3: CLI Tool

**Owner:** agent with Node.js CLI experience
**Estimate:** 2-3 hours
**Deliverable:** `npx loomkit <command>` works

### Commands

```
loomkit init                  # scaffold loomkit/ directory with config.yaml + schemas
loomkit brainstorm            # interactive (agent handles, CLI just scaffolds)
loomkit spec <name>           # create changes/<name>/ with proposal + spec template
loomkit design <name>         # add design.md to existing change
loomkit plan <name>           # add tasks.md to existing change
loomkit verify <name>         # run coverage gate, output .loomkit-verify.json
loomkit archive <name>        # merge verified change into living specs
loomkit status                 # show current changes + coverage
loomkit adapt <tool>          # generate adapter output (claude-code | codex)
```

### Implementation Steps

1. Create `src/cli/` with commander.js or similar
2. `init` — copy `schemas/` + `templates/` + `config.yaml` into project
3. `spec/design/plan` — scaffold directory + template files
4. `verify` — run `src/verify/verify.ts` logic, output JSON
5. `archive` — run `src/archive/archive.ts` + `src/spec/delta.ts` merge logic
6. `status` — read all changes dirs, show coverage
7. `adapt` — run adapter generators
8. Add bin entry to package.json

**Verify:** `npx loomkit init && npx loomkit spec test-feature && npx loomkit verify test-feature` works end-to-end

---

## Phase 4: Templates & Schema Finalization

**Owner:** any agent
**Estimate:** 1 hour
**Deliverable:** polished templates, config schema with all options

### Steps

1. Review `schemas/spec-driven/templates/*.md` — ensure they match SKILL.md instructions
2. Review `schemas/spec-driven/schema.yaml` — ensure artifact definitions match actual workflow
3. Add `config-schema.ts` — Zod schema for config.yaml validation (enhance `src/config/loader.ts`)
4. Add template variables support (`{{PROJECT_NAME}}`, `{{DATE}}`, etc.)
5. Write `loomkit/README.md` — getting started guide

**Verify:** templates render correctly with variable substitution

---

## Phase 5: Integration Test (dogfooding)

**Owner:** any agent
**Estimate:** 1-2 hours
**Deliverable:** LoomKit designs itself using its own workflow

### Steps

1. Use `loomkit spec cli-tool` to create a change for CLI implementation
2. Follow brainstorm → spec → design → plan → tdd → verify → archive
3. This IS the integration test — if the workflow breaks, the SKILL.md needs fixing
4. Fix any issues found during dogfooding
5. Document learnings

**Verify:** LoomKit can design a feature using its own workflow end-to-end

---

## Execution Order

```
Phase 0 (fix build)     → prerequisite, do first
Phase 1 (SKILL.md)     → core product, highest priority
Phase 2 (adapters)      → depends on Phase 1
Phase 3 (CLI)           → can parallel with Phase 2
Phase 4 (templates)     → can parallel with Phase 3
Phase 5 (dogfood)       → depends on all above
```

**Parallelizable:**
- Phase 2 + Phase 3 + Phase 4 can run concurrently after Phase 1
- Each can be assigned to different agents

**Assignment suggestion:**
- Phase 1 → Claude Code (writing quality matters)
- Phase 2 → agent familiar with both tools
- Phase 3 → Codex (code-focused)
- Phase 4 → any agent
- Phase 5 → pair (human reviews, agent executes)

---

*Plan: Aria — 2026-04-29*
