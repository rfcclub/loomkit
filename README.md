# LoomKit

Intent-guided spec-driven design framework with TDD superpowers. For AI agents and humans.

> ⚠️ **`@beta` npm tag = the harness pipeline install.** `npm install
> @gotako/loomkit` (default tag) gets the stable spec-driven workflow
> only. `npm install @gotako/loomkit@beta` additionally pulls in real
> `@gotako/hammerhead-debug@beta` and `seal-gate@beta` dependency
> versions — the full four-package harness pipeline (see
> [HARNESS.md](./HARNESS.md)) — without needing all repos cloned side
> by side. **The `@beta` chain expects crashes, missing pieces, and
> breaking changes without notice.** Not production-ready. Only use it
> if you know what you're doing.

> **Two workflows.** This README covers the spec-driven flow below
> (Intent → Spec → Design → Plan → TDD → Verify → Archive). For the
> weak-model / hash-chained task pipeline — `plan.json`, `gate-code`,
> mutation-probing, and hypothesis-gated debugging via
> `hammerhead-debug` — see **[HARNESS.md](./HARNESS.md)**.

## The Ecosystem — Four Tools, One Job Each

**LoomKit doesn't work alone once you're past the basic spec-driven
flow above.** Three sibling tools plug in for the harder job — driving
a weaker/cheaper model through small verified tasks without it losing
the thread:

1. **You write** `intent.md` → `plan.json` (small tasks, each with a
   test).
2. **pilotfish** reads `plan.json`, calls a model per task, retries on
   a failing test, escalates (never guesses) once retries run out.
3. Every task's diff gets checked by **seal-gate**: "does this diff
   actually match what it claims?" → `PASS` / `REVISE` / `BLOCK`.
4. If a task is stuck and nobody knows why: **hammerhead-debug** — no
   fix until a real breakpoint/log line CONFIRMS the cause, never a
   guess.

- **LoomKit** (this repo) — the lifecycle glue: `plan.json`,
  `phase.json`, `gate-code` orchestration. You'll always touch this
  one directly.
- **[pilotfish](https://github.com/rfcclub/pilotfish)** — automates
  "call a model, run the test, retry" so you don't do it by hand for
  every task. Optional — you can drive `plan.json` tasks manually
  instead.
- **[seal-gate](https://github.com/rfcclub/seal-gate)** — the actual
  quality check `gate-code` runs under the hood. Can also be called
  standalone in CI, outside LoomKit entirely.
- **[hammerhead-debug](https://github.com/rfcclub/hammerhead-debug)** —
  what you (or an agent) reach for when a task's test won't go green
  and guessing feels tempting. Standalone too — no dependency on
  LoomKit to use it on its own.

**Try it in 30 seconds, no setup:**
```bash
npm install @gotako/pilotfish@beta   # pulls all four automatically
npx loomkit --help
npx hammerhead-debug --help
npx pilotfish --help
```

Full walkthrough (real commands, real output, step by step) is in
**[HARNESS.md](./HARNESS.md)** — this section is the map, that
document is the manual.

## Quick Start

```bash
# Install
pnpm add -g @gotako/loomkit
# OR use from repo
cd ~/repo/loomkit
pnpm build

# Use in any project
mkdir my-project && cd my-project
loomkit init
loomkit intent my-feature   # separate problem from solution first
loomkit spec my-feature
```

## Workflow

```
intent → brainstorm → spec → design → plan → tdd → verify → archive
    │         │          │        │        │      │        │        │
 intent.md  proposal   spec.md  design  tasks   code    verify  archive/
            .md                 .md      .md    +tests  .json   merged specs
```

## Commands

| Command | Description |
|---------|-------------|
| `loomkit init` | Scaffold loomkit/ directory |
| `loomkit intent <name>` | Create intent artifact (problem, outcome, non-goals) |
| `loomkit spec <name>` | Create change with proposal + spec |
| `loomkit design <name>` | Add technical design |
| `loomkit plan <name>` | Add TDD implementation plan |
| `loomkit verify [name]` | Run coverage gate |
| `loomkit archive <name>` | Archive verified change |
| `loomkit status` | Show all changes + coverage |
| `loomkit show [name]` | Show change details (all if no name) |
| `loomkit adapt <tool>` | Show adapter setup |

## Skills

| Phase | Skill | Description |
|-------|-------|-------------|
| Intent | `skills/intent/SKILL.md` | Capture problem, outcome, non-goals before spec |
| Brainstorm | `skills/brainstorm/SKILL.md` | Socratic exploration, 2-3 approaches |
| Spec | `skills/spec/SKILL.md` | WHEN/THEN requirements-as-code |
| Design | `skills/design/SKILL.md` | Technical design with test strategy |
| Plan | `skills/plan/SKILL.md` | Bite-sized TDD tasks, exact code |
| TDD | `skills/tdd/SKILL.md` | RED/GREEN/REFACTOR enforcement |
| Verify | `skills/verify/SKILL.md` | Scenario coverage gate |
| Archive | `skills/archive/SKILL.md` | Merge specs, archive change |
| Executing Plans | `skills/executing-plans/SKILL.md` | Execute plan tasks sequentially |
| Subagent-Driven | `skills/subagent-driven/SKILL.md` | Per-task subagent dispatch |
| Verification | `skills/verification-before-completion/SKILL.md` | Evidence before assertions |
| Finishing Branch | `skills/finishing-branch/SKILL.md` | Merge/PR/cleanup options |
| Parallel Agents | `skills/parallel-agents/SKILL.md` | Dispatch independent tasks in parallel |
| Writing Skills | `skills/writing-skills/SKILL.md` | Create and review LoomKit skills |

## Users

- **AI agents** → follow SKILL.md workflow (14 phases)
- **Humans** → read markdown specs, review plans, git approve

## Adapters

| Tool | File | Status |
|------|------|--------|
| Claude Code | `adapters/claude-code/CLAUDE.md` | ✅ |
| Codex | `adapters/codex/AGENTS.md` | ✅ |
| Claude Cowork | `adapters/claude-cowork/` | 🔮 Future |
| Codex App | `adapters/codex-app/` | 🔮 Future |

## Development

```bash
pnpm build    # TypeScript compile
pnpm test     # Run 65+ tests
```

## Credits

LoomKit is one of four sibling tools built together as one pipeline —
see [The Ecosystem](#the-ecosystem--four-tools-one-job-each) above for
how they fit together, [HARNESS.md](./HARNESS.md) for the full manual.

- **[pilotfish](https://github.com/rfcclub/pilotfish)** — role-based
  task orchestrator that drives `plan.json` tasks through a model.
- **[seal-gate](https://github.com/rfcclub/seal-gate)** — the
  deterministic + optional-LLM quality gate `gate-code` runs.
- **[hammerhead-debug](https://github.com/rfcclub/hammerhead-debug)** —
  hypothesis-gated debugging, no fix without a confirmed observation.
- **[debug-skill](https://github.com/rfcclub/debug-skill)** — the real
  DAP CLI `hammerhead-debug`'s `dap` probe kind shells out to. A fork
  of [AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill)
  (MIT) — full credit to the original for the daemon-backed
  multi-backend DAP CLI this fork builds on.

## License

MIT
