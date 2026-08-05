# LoomKit

Intent-guided spec-driven design framework with TDD superpowers. For AI agents and humans.

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

## License

MIT
