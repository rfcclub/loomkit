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

Past the basic spec-driven flow above, three sibling tools plug in for
driving a weaker/cheaper model through small verified tasks:
**[pilotfish](https://github.com/rfcclub/pilotfish)** (calls a model
per `plan.json` task, retries on a failing test, escalates rather than
guessing), **[seal-gate](https://github.com/rfcclub/seal-gate)** (the
quality gate `gate-code` runs under the hood — PASS/REVISE/BLOCK), and
**[hammerhead-debug](https://github.com/rfcclub/hammerhead-debug)**
(hypothesis-gated debugging — no fix without a confirmed observation).
All three are usable standalone, outside LoomKit. Full walkthrough:
**[HARNESS.md](./HARNESS.md)**.

**Stability**: LoomKit and seal-gate are stable releases; pilotfish and
hammerhead-debug are still on the `beta` npm dist-tag.

```bash
npm install @gotako/pilotfish@beta   # pulls all four automatically
```

`hammerhead-debug`'s `dap` probe kind shells out to
[debug-skill](https://github.com/rfcclub/debug-skill), a fork of
[AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill)
(MIT) — full credit to the original for the daemon-backed
multi-backend DAP CLI this fork builds on.

## License

MIT
