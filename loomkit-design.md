# LoomKit — Design Framework with TDD Superpowers

## What Is LoomKit

LoomKit is a spec-driven design framework that combines OpenSpec's structured workflow with Superpowers' TDD enforcement.

- **From OpenSpec**: propose → spec → design → tasks → apply → archive workflow, config.yaml, living specs vs changes, delta specs, spec merging
- **From Superpowers**: brainstorm → spec → plan flow, bite-sized tasks with exact code, TDD Iron Law (RED/GREEN/REFACTOR), no placeholders, verification gate

**LoomKit is a fresh implementation**, not a wrapper. It takes methodology from both, implements cleanly in TypeScript.

## LoomKit Workflow

```
/lk:brainstorm  → Socratic dialogue, explore context, propose 2-3 approaches
/lk:spec        → Requirements-as-code with WHEN/THEN scenarios (from OpenSpec)
/lk:design      → Technical design with test strategy (from Superpowers)
/lk:plan        → Bite-sized tasks with exact code, TDD steps (from Superpowers)
/lk:apply       → RED → GREEN → REFACTOR → VERIFY per task (from Superpowers)
/lk:verify      → Scenario coverage check + test suite (LoomKit original)
/lk:archive     → Gate: verify must pass → merge specs (from OpenSpec)
```

## Key Differences From Source Projects

| Aspect | OpenSpec | Superpowers | LoomKit |
|--------|----------|-------------|---------|
| Workflow | propose→spec→design→tasks→apply→archive | brainstorm→spec→plan→TDD→review | Full merged pipeline |
| Spec format | WHEN/THEN scenarios | Free-form design doc | **OpenSpec's WHEN/THEN** (structured) |
| Plan format | Checkbox tasks | Bite-sized steps with exact code | **Superpowers' exact code steps** |
| TDD | Not enforced | SKILL.md rules (manual) | **Enforced**: verify gate blocks archive |
| Brainstorm | Not included | Socratic dialogue | **Included** as first phase |
| Verify | Manual review | Checklist | **Automated**: scenario coverage gate |

## What LoomKit Takes From Each

### From OpenSpec (~/repo/OpenSpec)
- `config.yaml` with schema, context, rules, per-artifact instructions
- Schema system: artifacts (proposal, specs, design, tasks) with templates + instructions
- Spec format: `### Requirement:` + `#### Scenario:` with WHEN/THEN
- Delta specs: ADDED/MODIFIED/REMOVED/RENAMED operations
- Spec merge on archive (delta → living specs)
- Change directory structure: `changes/<name>/proposal.md, specs/, design.md, tasks.md`
- Living specs: `specs/<capability>/spec.md`

### From Superpowers (~/repo/superpowers)
- Brainstorm skill: Socratic dialogue, one question at a time, 2-3 approaches, present design in sections
- Writing Plans skill: bite-sized steps (2-5 min), exact code in every step, no placeholders
- TDD skill: Iron Law (no code without failing test), RED/GREEN/REFACTOR cycle, delete code written before test
- Verification: checklist before marking done
- Plan structure: Task → Step → exact code → expected output → commit

### LoomKit Original
- TDD enforcement in verify gate (scenario coverage = test coverage)
- Traceability: scenario → test mapping
- Coverage threshold in config

## Directory Structure

```
project/
├── loomkit/
│   ├── config.yaml               # schema, context, rules, tdd config
│   ├── schemas/                  # workflow schemas (like OpenSpec)
│   │   └── spec-driven/
│   │       ├── schema.yaml       # artifact definitions + instructions
│   │       └── templates/        # proposal.md, spec.md, design.md, tasks.md
│   ├── specs/                    # living specs (source of truth)
│   │   └── auth/spec.md
│   ├── changes/                  # active changes
│   │   └── add-authentication/
│   │       ├── .loomkit-verify.json
│   │       ├── .traceability.yaml
│   │       ├── proposal.md
│   │       ├── specs/
│   │       │   └── auth/spec.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── archive/                  # completed changes
└── (project source code + tests)
```

## Artifacts (from OpenSpec's schema system)

| Artifact | File | Source |
|----------|------|--------|
| Brainstorm | (interactive, then → proposal.md) | Superpowers |
| Proposal | proposal.md | OpenSpec |
| Specs | specs/\<name\>/spec.md | OpenSpec + LoomKit (WHEN/THEN = test contract) |
| Design | design.md | OpenSpec + Superpowers (must include test strategy) |
| Tasks | tasks.md | Superpowers format (bite-sized, exact code, TDD steps) |
| Traceability | .traceability.yaml | LoomKit original |
| Verify | .loomkit-verify.json | LoomKit original |

## Config

```yaml
# loomkit/config.yaml
schema: spec-driven

tdd:
  framework: vitest
  enforce: true
  coverage_threshold: 100

context: |
  Project: [your project]
  Stack: [tech stack]

rules:
  proposal:
    - Include motivation and non-goals
    - Identify affected capabilities
  specs:
    - Every requirement needs ≥1 scenario
    - Scenarios use WHEN/THEN format
    - WHEN/THEN must be translatable to test cases
    - Use SHALL/MUST/SHOULD (RFC 2119)
  design:
    - Include test strategy section
    - Map scenarios to test files
  tasks:
    - Bite-sized steps (2-5 min each)
    - Exact code in every step (no placeholders)
    - TDD cycle: write failing test → verify fail → implement → verify pass → commit
    - Reference spec scenarios by ID
```

## Implementation Approach

Fresh TypeScript implementation. Read source repos for methodology reference only.

- **Don't** import `@fission-ai/openspec` or copy Superpowers code
- **Do** read their schemas, templates, and skills to understand the patterns
- **Do** reimplement the core logic cleanly, tailored to LoomKit's TDD-first approach

---

*Design: Aria — 2026-04-29*
*Sources: ~/repo/OpenSpec (MIT), ~/repo/superpowers (MIT)*
