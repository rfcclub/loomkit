# LoomKit

Intent-guided spec-driven design framework with TDD superpowers. For AI agents and humans.

## Why LoomKit?

AI agents building software fail the same ways, repeatedly:

- They read a vague request, silently pick a solution, and build that
  instead of the actual requirement — the user's *proposed fix* gets
  treated as *the spec*.
- Tests get written after the code, or skipped — nothing proves the
  result does what it claims.
- "Done" is whatever the agent says it is. No independent check runs
  before a human sees the diff.
- Work spanning multiple sessions or agents loses its trail: why a
  decision was made, what was explicitly out of scope, what's still
  unverified.

LoomKit is a set of gates that catch these before they ship:

- **Intent Gate** — separates the real problem from the proposed
  solution, captures non-goals and ambiguities, *before* a spec exists.
- **Spec as WHEN/THEN scenarios** with SHALL/MUST/SHOULD keywords — a
  requirement either has a scenario mapped to a real test, or it
  doesn't ship.
- **TDD Iron Law** — no production code without a failing test first,
  enforced by the workflow, not a reminder in a doc.
- **`loomkit verify`** — mechanically checks every SHALL/MUST scenario
  has a passing test and writes `.loomkit-verify.json`, instead of
  trusting the agent's word.
- **Everything is markdown + JSON, git-tracked** — a human reviews the
  actual spec/plan/verify report and approves via a normal git merge,
  not a chat summary.

> **Two install tags.** `npm install @gotako/loomkit` (default) is the
> stable spec-driven workflow below. `@beta` pulls in beta dependency
> versions for the wider harness pipeline instead — expect crashes and
> breaking changes without notice on that tag.
>
> **Two workflows.** This README covers the spec-driven flow below
> (Intent → Spec → Design → Plan → TDD → Verify → Archive). For the
> weak-model / hash-chained task pipeline (`plan.json`, `gate-code`,
> mutation-probing, hypothesis-gated debugging), see
> **[HARNESS.md](./HARNESS.md)**.

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
| `loomkit self-check <name>` | Scaffold self-check.md (claims, evidence, limitations) |
| `loomkit gate-code <name>` | Run SEAL gate on current diff |
| `loomkit craft <name>` | Show craft review verdict (maintainability) |
| `loomkit gate-pipeline` | Aggregate all change verdicts → SHIP/HOLD/ESCALATE |
| `loomkit learn <name>` | Extract lessons from gate history |
| `loomkit plan-json <action> <name>` | Weak-model task list (init/add/start/complete/finish/show) |
| `loomkit publish [--dry-run]` | Publish current version to npm |

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
| Systematic Debugging | `skills/systematic-debugging/SKILL.md` | Root-cause any bug/test failure before proposing a fix |
| Requesting Code Review | `skills/requesting-code-review/SKILL.md` | Dispatch a reviewer subagent before merging |
| Receiving Code Review | `skills/receiving-code-review/SKILL.md` | Verify feedback before implementing it |
| Using Git Worktrees | `skills/using-git-worktrees/SKILL.md` | Isolated workspace for feature work |

## Users

- **AI agents** → follow SKILL.md workflow (18 skills)
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

## Ecosystem

LoomKit is part of a larger harness pipeline — see
**[HARNESS.md](./HARNESS.md)** for how it fits with pilotfish,
seal-gate, and hammerhead-debug.

## Credits

`hammerhead-debug`'s `dap` probe kind shells out to
[debug-skill](https://github.com/rfcclub/debug-skill) (a fork of
[AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill), MIT).

## License

MIT
