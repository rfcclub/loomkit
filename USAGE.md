# LoomKit — Usage Guide

Intent-guided spec-driven design framework with TDD superpowers. Built for AI agents and humans working together.

> Current as of v1.6.1. For the harness/debug-pipeline side (install
> across all four packages, seal-gate/pilotfish/hammerhead-debug
> integration, full walkthrough), see [HARNESS.md](./HARNESS.md).

---

## Table of Contents

1. [What is LoomKit?](#what-is-loomkit)
2. [Install](#install)
3. [Workflow Overview](#workflow-overview)
4. [Using the CLI](#using-the-cli)
5. [Detailed Agent Workflow](#detailed-agent-workflow)
6. [Skills Reference](#skills-reference)
7. [Workflow for Humans](#workflow-for-humans)
8. [Adapter: Claude Code](#adapter-claude-code)
9. [Adapter: Codex](#adapter-codex)
10. [Project Structure](#project-structure)
11. [Config](#config)
12. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## What is LoomKit?

LoomKit is a collaboration framework between AI agents and humans, combining:

- **OpenSpec** — the propose → spec → design → tasks → apply → archive workflow, living specs, delta spec merge
- **Superpowers** — the TDD Iron Law (RED/GREEN/REFACTOR), bite-sized tasks with exact code, a verification gate
- **Intent Gate** — separates the problem from the proposed solution before writing a spec (LoomKit original)

**Core idea:** Everything is markdown, git-trackable. Humans read the spec, review the plan, approve via git merge. Agents execute each phase according to a SKILL.md.

**Tagline:** Intent → Spec → TDD → Trust

### When to use LoomKit?

- A feature has a complex spec and needs human review before code
- A project has multiple agents collaborating and needs a standard workflow
- TDD enforcement is required — no code before a test
- A feature needs traceability from intent → requirement → scenario → test
- You want to prevent an agent from confusing the user's proposed solution with the actual requirement

### When not to use it?

- Quick fixes / hotfixes (running the full workflow costs too much time)
- One-shot scripts, quick prototypes
- Agent decides the implementation on its own, no human review needed

---

## Install

### Global Install (npm/pnpm)

```bash
pnpm add -g @gotako/loomkit
# or
npm install -g @gotako/loomkit
```

### From Source

```bash
git clone <repo-url>
cd loomkit
pnpm install
pnpm build        # TypeScript compile
pnpm test         # run the test suite
```

### Verify Installation

```bash
loomkit --help
# Output: LoomKit — Intent-Guided Spec-Driven Design Framework with TDD Superpowers
```

---

## Workflow Overview

```
Human: idea / bug report
  │
  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  INTENT → BRAINSTORM → SPEC → DESIGN → PLAN → TDD → VERIFY → ARCHIVE   │
└──────────────────────────────────────────────────────────────────────────┘
  │          │           │       │        │      │       │        │
  ▼          ▼           ▼       ▼        ▼      ▼       ▼        ▼
intent.md  proposal.md  spec.md design  tasks   code   verify   archive/
                                  .md      .md    +tests  .json    merged specs
```

| Phase | Agent Does | Human Does | Output |
|-------|-----------|-----------|--------|
| **Intent** | Separate problem from solution, capture outcome, non-goals, constraints | Review + approve intent | `intent.md` |
| **Brainstorm** | Socratic dialogue, explore context, propose 2-3 approaches | Review proposal, pick a direction | `proposal.md` |
| **Spec** | Write requirements as WHEN/THEN | Review spec, approve | `specs/<name>/spec.md` |
| **Design** | Architecture, data model, test strategy | Review design | `design.md` |
| **Plan** | Bite-sized tasks with exact code, TDD cycle | Review plan, approve | `tasks.md` |
| **TDD** | RED → GREEN → REFACTOR — code + tests | (wait for result) | Code + `.traceability.yaml` |
| **Verify** | Scenario coverage gate + run test suite + intent coverage | Review verify report | `.loomkit-verify.json` |
| **Archive** | Merge delta spec into living spec, validate before merge | Git merge + tag | Archive metadata |

---

## Using the CLI

**Workspace directory naming:** every command resolves its workspace
dir the same way (`getLoomKitDir()` in `src/cli/utils.ts`): if a
directory named `openspec/` already exists in the project root, it's
used — this is intentional, for compatibility with the OpenSpec CLI's
own convention. Otherwise LoomKit falls back to `loomkit/`, which is
what `loomkit init` scaffolds on a brand-new project. This repo's own
workspace lives in `openspec/` (its old `loomkit/` was retired). Every
`loomkit/...` path below reads as `<loomkit/ or openspec/>/...`
depending on which one exists in your project.

### loomkit init

Creates the workspace structure (`loomkit/` by default) in a project:

```bash
cd my-project
loomkit init
```

Produces:
```
loomkit/
├── config.yaml              # default config
└── schemas/                 # schema files
```

### loomkit intent <name>

Creates the intent artifact — required for a workflow with the Intent Gate:

```bash
loomkit intent user-auth
```

Creates `loomkit/changes/user-auth/intent.md` with 15 sections: Raw Request, Problem, Desired Outcome, Users/Actors, Current Context, Proposed Direction, Scope, Non-Goals, Constraints, Success Criteria, Risks, Ambiguities (Blocking + Non-Blocking), Assumptions, Spec Seeds, Intent Approval.

**Intent Gate:** `loomkit spec <name>` will:
- **Warn** (default) if intent.md doesn't exist yet
- **Hard block** if config has `intent.enforce: true`

### loomkit spec <name>

Creates a new change:

```bash
loomkit spec user-auth
```

Produces:
```
loomkit/changes/user-auth/
├── proposal.md              # proposal template
└── specs/
    └── auth/
        └── spec.md          # spec template
```

### loomkit design <name>

Adds a design to an existing change:

```bash
loomkit design user-auth
```

Creates `loomkit/changes/user-auth/design.md`

### loomkit plan <name>

Adds an implementation plan:

```bash
loomkit plan user-auth
```

Creates `loomkit/changes/user-auth/tasks.md`

### loomkit show [name]

View change details:

```bash
loomkit show                    # list all changes with I/P/D/T/V flags
loomkit show user-auth          # view details of one change
```

### loomkit verify [name]

Runs the coverage gate — checks whether every SHALL/MUST scenario has a test:

```bash
loomkit verify                    # verify all changes
loomkit verify user-auth          # verify one change
```

Output: `.loomkit-verify.json` in the change directory.

### loomkit archive <name>

Archives a verified change:

```bash
loomkit archive user-auth
loomkit archive user-auth --force --reason="minor doc update"
```

Gate: verify must pass. Pre-merge validation checks the merged spec before writing. If validation fails, the archive is blocked.

### loomkit status

View the status of all changes + coverage:

```bash
loomkit status
```

### loomkit adapt <tool>

View adapter instructions:

```bash
loomkit adapt claude-code
loomkit adapt codex
```

### loomkit self-check <name>

Scaffolds `self-check.md` — declare claims, evidence, known limitations, and unresolved assumptions before the code gate runs:

```bash
loomkit self-check user-auth
```

### loomkit gate-code <name>

Runs the SEAL gate on the current diff — deterministic + optional LLM review, produces a trust score and a PASS/REVISE/BLOCK-style verdict:

```bash
loomkit gate-code user-auth [--skip-state-check] [--llm [provider]]
```

### loomkit craft <name>

Shows the craft review verdict (maintainability) for a change — if none exists yet, prints the prompt to generate one:

```bash
loomkit craft user-auth
```

### loomkit gate-pipeline

Aggregates every change's gate verdicts into one SHIP/HOLD/ESCALATE pipeline decision:

```bash
loomkit gate-pipeline
```

### loomkit learn <name>

Extracts lessons from a change's gate history (what tripped the gate, how it was resolved):

```bash
loomkit learn user-auth
```

### loomkit plan-json <action> <name> [options]

Weak-model task list, nested inside `phase.json`'s apply phase — the mechanical alternative to hand-writing `tasks.md` for models that need small, hash-chained, individually gated tasks:

```bash
loomkit plan-json init user-auth --trace INTENT-ID --resolved-by <name>
loomkit plan-json add user-auth --id TASK-1 --behavior "..." --acceptance "..." --files a.ts,b.ts --test tests/a.test.ts [--consumes ...]
loomkit plan-json start user-auth TASK-1 [--skip-state-check]
loomkit plan-json complete user-auth TASK-1 --test-cmd "npx vitest run tests/a.test.ts" [--debug-session ... --debug-cycle ... --root-cause ...] [--escalated]
loomkit plan-json finish user-auth   # closes the "apply" phase once every task is complete
loomkit plan-json show user-auth     # no options
```

### loomkit publish [--dry-run]

Publishes the current package version to npm — `--dry-run` packs and reports size without actually publishing:

```bash
loomkit publish --dry-run
loomkit publish
```

---

## Detailed Agent Workflow

### Phase 0: Intent

**Goal:** Separate the desired outcome from the proposed solution. Guards against a common mistake: the user hands over a solution, and the agent mistakes it for the requirement.

**How:**
1. Read the raw request, capture it verbatim
2. Separate: Problem (the real issue) ≠ Proposed Direction (the solution the user suggested)
3. Identify Non-Goals — what's explicitly excluded
4. Detect hidden implications: security, data, migration, compatibility
5. Classify ambiguity: Blocking (must resolve) vs Non-Blocking (can proceed with an assumption)
6. Write Spec Seeds — candidate requirements, NOT yet binding
7. Set status DRAFT, wait for human approval

**Output:** `intent.md`

### Phase 1: Brainstorm

**Goal:** Explore the problem, produce a proposal.

**How:**
1. Socratic dialogue — one question at a time with the human
2. Explore: problem, constraints, existing solutions
3. Generate at least 2-3 approaches
4. Each approach has: idea, trade-offs, risks

**Output:** `proposal.md`

### Phase 2: Spec

**Goal:** Write requirements-as-code with WHEN/THEN scenarios.

**Format:**
```markdown
### Requirement: <title> (SHALL|MUST|SHOULD|MAY)

<description>

#### Scenario: <title>

WHEN <condition>
THEN <expected outcome>
```

**Rules:**
- Every requirement has an RFC 2119 keyword: `SHALL` / `MUST` / `SHOULD` / `MAY`
- SHALL and MUST are mandatory — a test is required
- A scenario doesn't use OR (split into 2 scenarios if needed)
- AND clauses are fine within the same scenario

**Output:** `specs/<capability>/spec.md`

### Phase 3: Design

**Goal:** Technical design + test strategy.

**Contents:**
- Architecture decisions + rationale
- Test strategy: map scenarios → test files
- File structure changes
- Data model changes (if any)

**Output:** `design.md`

### Phase 4: Plan

**Goal:** Bite-sized tasks with exact code, TDD cycle.

**Rules:**
- Every task has a **Files** section (Create/Modify/Test + paths)
- Every step is bite-sized (2-5 minutes)
- Every step has exact code — **no placeholders, no TBD**
- TDD cycle: RED → GREEN → REFACTOR → COMMIT

**Output:** `tasks.md`

### Phase 5: TDD (Apply)

**Goal:** Implement following the TDD Iron Law.

**Iron Law:** No production code without a failing test first.

**Output:** Code + `.traceability.yaml`

### Phase 6: Verify

**Goal:** Coverage gate.

**Output:** `.loomkit-verify.json`

### Phase 7: Archive

**Goal:** Merge the spec, close out the change.

**Gate:** Verify passes. Pre-merge validation blocks if the merged spec fails.

---

## Skills Reference

LoomKit ships 18 skills — each one corresponds to a phase or a cross-cutting concern:

| Phase | Skill Directory | Trigger |
|-------|----------------|---------|
| Intent | `skills/intent/SKILL.md` | `/lk:intent` |
| Brainstorm | `skills/brainstorm/SKILL.md` | `/lk:brainstorm` |
| Spec | `skills/spec/SKILL.md` | `/lk:spec` |
| Design | `skills/design/SKILL.md` | `/lk:design` |
| Plan | `skills/plan/SKILL.md` | `/lk:plan` |
| TDD | `skills/tdd/SKILL.md` | `/lk:apply` |
| Verify | `skills/verify/SKILL.md` | `/lk:verify` |
| Archive | `skills/archive/SKILL.md` | `/lk:archive` |
| Executing Plans | `skills/executing-plans/SKILL.md` | Execute plan tasks sequentially |
| Subagent-Driven | `skills/subagent-driven/SKILL.md` | Per-task subagent dispatch |
| Verification | `skills/verification-before-completion/SKILL.md` | Evidence before assertions |
| Finishing Branch | `skills/finishing-branch/SKILL.md` | Merge/PR/cleanup |
| Parallel Agents | `skills/parallel-agents/SKILL.md` | Dispatch independent tasks |
| Writing Skills | `skills/writing-skills/SKILL.md` | Create new LoomKit skills |
| Systematic Debugging | `skills/systematic-debugging/SKILL.md` | Any bug/test failure/unexpected behavior — find root cause before proposing a fix |
| Requesting Code Review | `skills/requesting-code-review/SKILL.md` | Completing tasks or major features — dispatches a reviewer subagent |
| Receiving Code Review | `skills/receiving-code-review/SKILL.md` | Before implementing review feedback — requires verification, not just agreement |
| Using Git Worktrees | `skills/using-git-worktrees/SKILL.md` | Starting feature work that needs isolation from the current workspace |

---

## Workflow for Humans

Humans don't write code (that's the agent's job). Humans:

1. **Review & Approve** — read the intent, proposal, spec, design, plan
2. **Git merge** — approve changes
3. **Catch what agents miss** — edge cases, business logic, design flaws
4. **Decide direction** — pick an approach from the brainstorm, approve the intent

| Phase | File to Read | What to Check |
|-------|-------------|-----------|
| Intent | `intent.md` | Is the problem right? Are non-goals sufficient? Is ambiguity resolved? |
| Brainstorm | `proposal.md` | Is the direction right? |
| Spec | `spec.md` | Are requirements sufficient? Any missing edge case? |
| Design | `design.md` | Is the architecture reasonable? |
| Plan | `tasks.md` | Are tasks feasible? Anything missed? |
| Verify | `.loomkit-verify.json` | Is coverage sufficient? Do tests pass? |

---

## Adapter: Claude Code

### Install

```bash
cd ~/repo/loomkit
bash adapters/claude-code/generate-skills.sh
```

### Slash Commands

| Command | Phase |
|---------|-------|
| `/lk:intent` | Intent Gate |
| `/lk:brainstorm` | Brainstorm |
| `/lk:spec` | Spec |
| `/lk:design` | Design |
| `/lk:plan` | Plan |
| `/lk:apply` | TDD |
| `/lk:verify` | Verify |
| `/lk:archive` | Archive |

---

## Adapter: Codex

```bash
cd ~/repo/loomkit
bash adapters/codex/generate-instructions.sh
```

See `adapters/codex/AGENTS.md` for details.

---

## Project Structure

```
my-project/
├── loomkit/
│   ├── config.yaml
│   ├── changes/
│   │   └── user-auth/
│   │       ├── intent.md              # Intent artifact
│   │       ├── proposal.md
│   │       ├── specs/auth/spec.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       ├── .traceability.yaml
│   │       └── .loomkit-verify.json
│   ├── specs/                         # Living specs
│   │   └── auth/spec.md
│   ├── archive/                       # Completed changes
│   └── schemas/                       # Templates + schemas
├── src/
└── tests/
```

---

## Config

`loomkit/config.yaml`:

```yaml
schema: spec-driven

tdd:
  framework: vitest
  enforce: true
  coverage_threshold: 100

intent:
  enforce: false                       # true = hard block spec without intent
  require_approval_before_spec: false   # true = intent must be APPROVED
  require_no_blocking_ambiguities: false # true = no blocking ambiguities allowed

context: |
  Project: my-project
  Stack: TypeScript, Bun

rules:
  intent:
    - Separate outcome from solution
    - Include scope and non-goals
    - Status must be APPROVED before spec phase (when enforced)
  proposal:
    - Include motivation and non-goals
  specs:
    - Every requirement needs ≥1 scenario
    - Scenarios use WHEN/THEN format
  design:
    - Include test strategy section
  tasks:
    - Bite-sized steps with exact code
    - No placeholders
```

---

## FAQ & Troubleshooting

### "loomkit: command not found"?

```bash
export PATH="$(pnpm bin):$PATH"
# or use npx
npx loomkit <command>
```

### Intent Gate blocking spec?

Add intent.md first:
```bash
loomkit intent <name>
# Or disable the gate:
# config: intent.enforce: false
```

### Verify failing?

Check `.traceability.yaml` — every SHALL/MUST scenario needs a test mapping.

### Archive blocked by validation?

Fix the spec to match the expected format (needs a Purpose section, scenarios need a THEN clause), verify again, then archive.

### Want to cancel a change?

```bash
rm -rf loomkit/changes/<name>
```

---

*Intent → Spec → TDD → Trust*
