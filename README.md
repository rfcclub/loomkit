# LoomKit

Spec-driven design framework with TDD superpowers. For AI agents and humans.

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
loomkit spec my-feature
```

## Workflow

```
brainstorm → spec → design → plan → tdd → verify → archive
    │          │        │        │      │        │        │
 proposal.md  spec.md   design   tasks   code    verify  archive/
                          .md      .md    +tests  .json   merged specs
```

## Commands

| Command | Description |
|---------|-------------|
| `loomkit init` | Scaffold loomkit/ directory |
| `loomkit spec <name>` | Create change with proposal + spec |
| `loomkit design <name>` | Add technical design |
| `loomkit plan <name>` | Add TDD implementation plan |
| `loomkit verify [name]` | Run coverage gate |
| `loomkit archive <name>` | Archive verified change |
| `loomkit status` | Show all changes + coverage |
| `loomkit adapt <tool>` | Show adapter setup |

## Users

- **AI agents** → follow SKILL.md workflow (7 phases)
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
