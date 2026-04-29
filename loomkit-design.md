# LoomKit — Spec-Driven Design Framework with TDD Superpowers

## What Is LoomKit

LoomKit is a **collaboration framework for AI agents and humans**. It combines OpenSpec's structured workflow with Superpowers' TDD enforcement.

**Two layers, one workflow:**
1. **Skill instructions** (Superpowers-style) — agents know *what to do* at each phase
2. **Output format** (OpenSpec-style) — humans can *read and review* specs, plans, coverage

Both layers are markdown. Both are git-trackable. Humans approve via git merge; agents proceed after approval.

- **From OpenSpec**: propose → spec → design → tasks → apply → archive workflow, config.yaml, living specs vs changes, delta specs, spec merging
- **From Superpowers**: brainstorm → spec → plan flow, bite-sized tasks with exact code, TDD Iron Law (RED/GREEN/REFACTOR), no placeholders, verification gate

**LoomKit is a fresh implementation**, not a wrapper. It takes methodology from both.

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

## Users

| User | What They Do | How They Interact |
|------|-------------|-------------------|
| **Agent** | Follow workflow, generate specs, write TDD plans, implement code | SKILL.md instructions per phase |
| **Human** | Read specs, review plans, approve/reject, catch what agents miss | Read markdown, git review/merge |

Output must be **human-readable by design**. Spec markdown, plan markdown, coverage reports. Not JSON schemas or API calls. Human looks at `changes/<feature>/` and immediately understands: what's proposed, what's required, how it'll be built.

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

**Two-layer architecture:**

### Layer 1: Skill Instructions (Superpowers-style)
SKILL.md files for each phase — agent reads and follows.

Located in `skills/`:
```
skills/
├── brainstorm/SKILL.md    — Socratic dialogue, explore context
├── spec/SKILL.md          — Write WHEN/THEN requirements
├── design/SKILL.md        — Technical design with test strategy
├── plan/SKILL.md          — Bite-sized TDD tasks with exact code
├── tdd/SKILL.md           — RED/GREEN/REFACTOR enforcement
├── verify/SKILL.md        — Scenario coverage check
└── archive/SKILL.md       — Gate: verify pass → merge specs
```

### Layer 2: Validation Tool (TypeScript)
Companion tool for format checking, enforcement, and coverage calculation.

Located in `src/`:
```
src/
├── spec/       — parser, validator, assertion, delta, merge
├── plan/       — no-placeholder, TDD order, file path validator
├── config/     — Zod schema, defaults, env var substitution
├── tdd/        — traceability mapping, coverage calculator
├── verify/     — coverage gate
├── archive/    — archive gate, force archive
├── brainstorm/ — parser, validator
└── schema/     — YAML workflow schema loader
```

### How They Work Together
- Agent reads SKILL.md → follows workflow → generates markdown artifacts
- Validation tool checks artifacts: format correct? TDD order? Coverage met?
- Human reads markdown → reviews → approves/rejects via git

## Coding Tool Support

LoomKit targets AI coding agents. Each tool has different conventions for how agents receive instructions.

### Core Support (now)

| Tool | Instruction Method | Notes |
|------|-------------------|-------|
| **Claude Code** | `CLAUDE.md` + skill files in `~/.claude/skills/` | SKILL.md format native |
| **Codex** | `AGENTS.md` + instructions | OpenClaw-style instructions |

SKILL.md files work as-is for Claude Code. For Codex, LoomKit generates equivalent `AGENTS.md` fragments or the human adapts SKILL.md into Codex instructions.

### Future Support (planned)

| Tool | Type | Integration Path |
|------|------|----------------|
| **Claude Cowork** | Desktop app (multi-agent) | TBD — likely shared context files + SKILL.md |
| **Codex (app)** | Desktop app | TBD — likely OpenClaw adapter or native plugin |

Design principle: **same markdown artifacts, different instruction adapters**. The spec/plan/verify output doesn't change per tool — only how the agent *receives* the workflow instructions changes.

```
loomkit/
├── skills/              # SKILL.md (tool-agnostic source of truth)
├── adapters/
│   ├── claude-code/     # CLAUDE.md + ~/.claude/skills/ format
│   ├── codex/           # AGENTS.md format
│   ├── claude-cowork/   # (future) app integration
│   └── codex-app/       # (future) app integration
└── src/                 # validation tool (shared)
```

**Don't** import `@fission-ai/openspec` or copy Superpowers code
**Do** read their source to understand methodology, reimplement cleanly

---

*Design: Aria — 2026-04-29*
*Sources: ~/repo/OpenSpec (MIT), ~/repo/superpowers (MIT)*
*Updated: 2026-04-29 — dual-user model, coding tool adapters (Claude Code + Codex + future apps)*
