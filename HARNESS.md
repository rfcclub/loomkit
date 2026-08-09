# LoomKit Harness — Weak-Model Development & Debugging Pipeline

This is the **second workflow** LoomKit supports, alongside the original
Intent → Spec → Design → Plan → TDD → Verify → Archive flow described in
`README.md`. The harness workflow exists for a different situation: you
want *mechanically verifiable, small, hash-chained* work units that a
weaker or cheaper model (or a careful human) can execute one at a time
without losing the thread — instead of a single large `tasks.md` a strong
model writes once and a weak model tries to follow.

If `README.md`'s workflow is "spec-driven," this one is "plan-driven":
the intelligence goes **upstream**, into splitting work into small,
provable tasks. Downstream, each task is mechanical: write a failing
test from the acceptance criterion, make it pass, gate it, move on.

## The Four Pillars

Four packages work together, named after fish, each pulled out of
LoomKit as its own repo the moment it became a reusable concern rather
than a LoomKit-specific implementation detail:

| Package | Role | Repo | Status |
|---|---|---|---|
| **orca — LoomKit** (this repo) | Lifecycle, plan tasks, gate orchestration | `~/work/loomkit` — [github.com/rfcclub/loomkit](https://github.com/rfcclub/loomkit) | real, published (`@gotako/loomkit`) |
| **seal — seal-gate** | Verification: does the diff actually match the claim? | `~/work/seal-gate` — [github.com/rfcclub/seal-gate](https://github.com/rfcclub/seal-gate) | real, published (`seal-gate`) |
| **hammerhead — hammerhead-debug** | Hypothesis-gated debugging (DAP or log evidence) when a task gets stuck | `~/work/hammerhead-debug` — [github.com/rfcclub/hammerhead-debug](https://github.com/rfcclub/hammerhead-debug) | real, on GitHub (not yet published to npm) |
| **pilotfish** | Drives a model through `plan.json` tasks by role, retries on failure, escalates to hammerhead-debug instead of guessing | `~/work/pilotfish` — [github.com/rfcclub/pilotfish](https://github.com/rfcclub/pilotfish) | real, on GitHub (not yet published to npm) |

A fifth repo backs `hammerhead-debug`'s `dap` probe kind: a fork of
[AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill) at
[github.com/rfcclub/debug-skill](https://github.com/rfcclub/debug-skill)
(`~/work/debug-skill`), extended with three experimental backends
(C#/.NET, ELF/ARM/assembly, Java) behind `DAP_EXPERIMENTAL_BACKENDS=1` —
see that repo's README for real, verified usage of each. Not one of the
"four pillars" (hammerhead-debug is the pillar; debug-skill is what its
`dap` probe kind shells out to), but worth knowing about if a debug
session needs a language beyond the original five.

None of the four know about each other's internals — each consumes the
others strictly as a dependency or a subprocess CLI, the same way any
external consumer would:

```text
                    ┌─────────────┐
                    │  pilotfish   │  drives tasks by role, retries,
                    │              │  escalates on exhaustion
                    └──────┬───────┘
                           │ reads plan.json via
                           │ @gotako/loomkit's public API
                           ▼
    ┌─────────────────────────────────────────┐
    │              orca — LoomKit               │  lifecycle, plan.json,
    │                                             │  phase.json, gate-code
    └───────┬─────────────────────────┬─────────┘
            │ file: dependency         │ file: dependency
            ▼                          ▼
    ┌───────────────┐         ┌─────────────────────┐
    │  seal — seal-gate│         │ hammerhead-debug     │  hypothesis-gated
    │  quality gate,   │         │ (also invoked        │  debug loop,
    │  mutation-probe  │         │  directly by a human  │  DAP or log
    │                  │         │  or an agent, not      │  evidence
    │                  │         │  only via loomkit)     │
    └───────────────┘         └──────────┬─────────────┘
                                          │ subprocess
                                          ▼
                                ┌───────────────────────┐
                                │ ~/work/debug-skill      │  real DAP CLI
                                │ (dap binary — fork of   │  (external, Go)
                                │  AlmogBaku/debug-skill) │
                                └───────────────────────┘
```

## Install — Beta npm Channel (simplest, no sibling repos needed)

```bash
npm install @gotako/pilotfish@beta
# or just the harness core, without pilotfish's automation:
npm install @gotako/loomkit@beta
```

`@beta` resolves the **real** dependency chain from npm — no sibling
repos, no `file:` paths, no manual clone order. `pilotfish@beta` pulls
`@gotako/loomkit@beta`, which pulls `@gotako/hammerhead-debug@beta` and
`seal-gate@beta`. Verified end-to-end (2026-08-09): built + tested every
package against its real published dependency, not the local sibling
clone, before publishing.

⚠️ **This is genuinely beta** — expect breaking changes without notice,
not a stability guarantee. The default (non-`@beta`) dist-tag installs
only `@gotako/loomkit`'s own spec-driven workflow with no harness
dependencies at all — that's the stable path if you don't need
`gate-code`/`plan-json`/pilotfish/hammerhead-debug.

## Install From Source (all four, for local development)

All four repos must sit **side by side** under the same parent directory
(here, `~/work/`) **only if you're developing the harness itself and
want `file:`-style live-edit resolution** — for just using the
pipeline, the beta npm channel above is simpler and doesn't need this.

```bash
mkdir -p ~/work && cd ~/work
git clone git@github.com:rfcclub/loomkit.git
git clone git@github.com:rfcclub/seal-gate.git
git clone git@github.com:rfcclub/hammerhead-debug.git
git clone git@github.com:rfcclub/pilotfish.git
# optional fifth: only needed for hammerhead-debug's `dap` probe kind
# beyond the original five languages (see "Experimental Debug Backends"
# below)
git clone git@github.com:rfcclub/debug-skill.git
# (or: if you already have them, just make sure they live directly
#  under the same parent — ~/work/loomkit, ~/work/seal-gate, etc.)
```

**Note (since the 2026-08-09 beta release):** `loomkit`'s and
`pilotfish`'s committed `package.json` now point their
`@gotako/hammerhead-debug`/`seal-gate`/`@gotako/loomkit` dependencies at
real published `@beta` npm versions, not `file:../...` relative paths —
that's what makes the npm channel above work without sibling clones. If
you're editing `hammerhead-debug`/`seal-gate`/`loomkit` locally and want
`loomkit`/`pilotfish` to pick up your *uncommitted* changes live
(instead of whatever's on npm), re-point the dependency yourself:
`pnpm add @gotako/hammerhead-debug@file:../hammerhead-debug` (or the
equivalent for `seal-gate`/`loomkit`) — same escape hatch this section
already documents in "Troubleshooting" below, just now needed by
default rather than only when debugging a stale cache.

Build order matters a little — `seal-gate` and `hammerhead-debug` have no
dependency on the others, `loomkit` depends on both of them, `pilotfish`
depends on `loomkit`:

```bash
# 1. seal-gate — no internal dependencies
cd ~/work/seal-gate
npm install
npx tsc                       # outputs dist/

# 2. hammerhead-debug — no internal dependencies
cd ~/work/hammerhead-debug
npm install
npx tsc                       # outputs dist/

# 3. loomkit — depends on both of the above via file:../seal-gate and
#    file:../hammerhead-debug
cd ~/work/loomkit
pnpm install
pnpm build                    # tsc — outputs dist/

# 4. pilotfish — depends on loomkit via file:../loomkit
cd ~/work/pilotfish
npm install
npx tsc                       # outputs dist/
```

Each package exposes a `bin` entry (`loomkit`, `hammerhead-debug`,
`pilotfish`). Once built, invoke any of them either:
- by full path: `node ~/work/loomkit/dist/cli/index.js ...`,
  `node ~/work/hammerhead-debug/dist/cli.js ...`,
  `node ~/work/pilotfish/dist/cli.js ...`
- or, from inside a project that has them installed as a real
  dependency: `node_modules/.bin/loomkit ...` etc.

### One-time: install the hammerhead-debug skill

So an agent (Claude Code, Codex) can invoke hammerhead-debug's
hypothesis-gated workflow directly as a skill, instead of you pasting
instructions manually every time:

```bash
node ~/work/hammerhead-debug/dist/cli.js install
# copies skill/SKILL.md to:
#   ~/.claude/skills/hammerhead-debug/SKILL.md
#   ~/.codex/skills/hammerhead-debug/SKILL.md
# --agent claude-code|codex   → install to only one agent
# --project                    → install into ./.claude/skills/, ./.codex/skills/
#                                 (relative to cwd) instead of your home directory
```

Verify it worked: the skill should show up as available in your next
Claude Code / Codex session (or restart the current one). You can also
just check the file exists: `cat ~/.claude/skills/hammerhead-debug/SKILL.md`.

### Troubleshooting: "changes to a `file:` dependency aren't showing up"

This bit us **four separate times** while building this pipeline, so it's
worth documenting plainly rather than re-discovering it: **pnpm (and to a
lesser extent npm) cache the resolved contents of a `file:` dependency**.
Rebuilding the *source* repo (e.g. `hammerhead-debug`) is not enough —
the *consuming* repo (`loomkit`) may keep serving a stale copy from its
own `node_modules` even after you `pnpm install` again.

What reliably works, in order of increasing force:
1. Bump the dependency's own `version` field in its `package.json` (even
   a trivial patch bump, e.g. `0.3.0` → `0.4.0`) — this changes the
   resolved package identity, forcing a real refresh.
2. Re-run `pnpm install` in the consumer.
3. If that still doesn't pick it up: `pnpm remove <pkg>` then
   `pnpm add <pkg>@file:../<path>` in the consumer — a full re-add, not
   just a reinstall.
4. `pnpm store prune` (clears pnpm's global content-addressable store) —
   last resort; did **not** fix the issue on its own in testing here, the
   version bump was what actually mattered.

If `tsc` in the consuming repo suddenly says `Cannot find module
'./some-new-file.js'` after you added a new export to a `file:`
dependency and rebuilt it, this is almost certainly why.

## The Lifecycle

```
intent → plan → branch → apply → gate-code → verify → finish → archive → learn
```

- **intent**: human-approved problem statement. Never touched by the
  executing model.
- **plan**: `plan.json` — a flat list of small tasks, each with an
  embedded micro-spec (`behavior` + `acceptance`), file scope (≤2 files),
  and a designated test. This is where the hard thinking (task-splitting)
  happens, once, usually by a stronger model or a human.
- **apply**: for each task, in order — write a failing test from
  `acceptance`, write code, run the test, mark complete. Each task
  produces a hash of its output files; later tasks that `--consumes`
  those files are blocked if the hash doesn't match (someone changed the
  file since it was produced). This step can be done by hand, or driven
  automatically by **pilotfish** (see below).
- **gate-code**: run the SEAL quality gate against the current diff —
  produces a PASS/BLOCK verdict, a trust score, and (if `plan.json`
  tasks have tests) a mutation-probe pass confirming each test actually
  pins its behavior, not just asserts something true-by-construction.

## Step-by-Step Walkthrough (manual)

Run these from the root of any project (a real one, or a scratch
directory — LoomKit doesn't care).

### 1. Start a change

```bash
loomkit intent my-feature
```

Creates `loomkit/changes/my-feature/intent.md` (or `openspec/changes/...`
if an `openspec/` directory already exists at the project root — LoomKit
detects which convention the project uses). Edit it: fill in the
problem, desired outcome, and set `Status: APPROVED` at the bottom before
continuing — `plan-json init` requires a resolved trace target.

### 2. Build the plan

```bash
loomkit plan-json init my-feature --trace intent.md --resolved-by your-name

loomkit plan-json add my-feature \
  --id TASK-1 \
  --behavior "what this task makes true" \
  --acceptance "the specific, testable condition" \
  --files src/thing.ts \
  --test tests/thing.test.ts
  # optional: --consumes path/produced/by/an/earlier/task.ts
```

`add` enforces the smallness rule directly: more than 2 files, or a
missing `--test`/`--acceptance`, is rejected before it ever becomes a
task an executing model could flail on.

### 3. Work the task

```bash
loomkit plan-json start my-feature TASK-1
```

Now write the failing test (from `--acceptance`), then the code, then:

```bash
loomkit plan-json complete my-feature TASK-1 --test-cmd "bun test tests/thing.test.ts"
```

This actually **runs** `--test-cmd` and only marks the task complete if
it exits 0. Every file in `--files`/`--test` gets hashed and recorded —
that hash is what later tasks' `--consumes` checks against.

### 4. Stuck? Use hammerhead-debug

If a task's test won't go green and you don't understand why, don't
guess — open a hypothesis-gated debug session (see
`~/work/hammerhead-debug/skill/SKILL.md` for the full guide, or just say
"use hammerhead-debug" to an agent that has the skill installed):

```bash
node ~/work/hammerhead-debug/dist/cli.js open \
  --symptom "what's actually wrong" --repro "command that reproduces it" \
  --dir loomkit/changes/my-feature

# hammerhead-debug hypothesis <session-id> "<why you think it happens>" --predict "<what you'd see if right>" --dir loomkit/changes/my-feature
# hammerhead-debug probe <session-id> --kind instrumentation --observation "<real captured evidence>" --dir loomkit/changes/my-feature
#   (or --kind dap --script <path> --break <file:line> --evaluate "<expr>" for a real breakpoint)
# hammerhead-debug verdict <session-id> --result CONFIRMED --reason "..." --dir loomkit/changes/my-feature
```

Once the cycle is CONFIRMED, feed it back into `plan-json complete` so
the fix is traceable to real evidence, not a guess:

```bash
loomkit plan-json complete my-feature TASK-1 \
  --test-cmd "bun test tests/thing.test.ts" \
  --debug-session dbg-XXXXXXXX --debug-cycle c-1 --root-cause "what was actually wrong"
```

`plan-json complete` verifies the referenced cycle is really CONFIRMED
before accepting this — a fabricated or refuted debug session is
rejected, not silently trusted.

### 5. Close out the plan, run the gate

```bash
loomkit plan-json finish my-feature   # once every task is complete

loomkit self-check my-feature          # scaffolds self-check.md — fill in
                                        # Claims / Evidence (JSON) / Known
                                        # Limitations / Unresolved Assumptions

loomkit gate-code my-feature           # runs the real SEAL gate + mutation-probe
```

`gate-code` prints a verdict (`PASS` / `PASS_WITH_WARNINGS` / `BLOCK` /
`REVISE`), a trust score, and any advisory notes — including
`SPEC_UNTESTED` warnings if a task's test doesn't actually pin its
behavior (confirmed by mutating the test's own assertions and checking
it still passes when it shouldn't).

### 6. Verify, archive

```bash
loomkit verify my-feature
loomkit archive my-feature
```

## Seal Gate — What `gate-code` Actually Calls

`loomkit gate-code` (step 5 above) is a thin wrapper around seal-gate's
own `Seal.review()` — worth knowing the real shape underneath if you
need to call it directly (a CI step, a non-LoomKit workflow, or
debugging why a gate produced the verdict it did).

```ts
import { Seal } from 'seal-gate'
import { TrustMemory } from 'seal-gate/trust-memory'

// One-time setup — persists reliability scoring across calls/sessions
const agentMemory = new TrustMemory()
Seal.withTrustMemory(agentMemory)

const verdict = await Seal.review({
  artifact_type: 'code_diff',              // llm_response | code_diff | test_plan | design | migration
  spec: '- Auth must validate JWT\n- Return 401 on invalid token',
  output: agentOutput,
  evidence: {
    test_log: 'PASS: 12 tests, 0 failed',
    build_log: '',
    diff: '',
    references: [
      { type: 'command', command: 'bun test', exit_code: 0, output: 'all pass' },
    ],
  },
  context: { agent_id: 'aria', agent_role: 'aria' },
})

verdict.verdict              // PASS | PASS_WITH_WARNINGS | REVISE | ESCALATE_TO_HUMAN | BLOCK
verdict.trust_score          // 0–100
verdict.next_action          // human-readable instruction
verdict.blocking_issues      // must-fix issues, if any
```

Real verdict thresholds (this is what `gate-code`'s printed verdict
maps to):

| Verdict | Trust Score | What LoomKit does |
|---|---|---|
| `PASS` | ≥ 85 | `gate-code` exits 0 — proceed to `verify` |
| `PASS_WITH_WARNINGS` | 70–84 | exits 0, prints advisory notes (e.g. `SPEC_UNTESTED`) |
| `REVISE` | 50–69 | exits non-zero — `blocking_issues` names what to fix |
| `ESCALATE_TO_HUMAN` | 30–49 | exits non-zero — halt, a human must review |
| `BLOCK` | < 30, or a hard rule (see below) | exits non-zero — do not proceed |

A handful of hard rules `BLOCK`/`ESCALATE` regardless of trust score —
the ones most likely to fire inside a LoomKit-driven change:

| Rule | Trigger |
|---|---|
| `E001` | a claim like "tests pass" with no `test_log` evidence attached |
| `AX501` | `DROP TABLE` / `rm -rf` without an adjacent explicit confirmation |
| `AX503` | a migration with no rollback plan |
| `TW205` | an auth-related change with no unauthorized-access test |

Standalone CLI, outside LoomKit entirely (a plain CI step, for
example):

```bash
cd ~/work/seal-gate
bun run src/cli.ts review \
  --output /path/to/agent-output.txt \
  --spec /path/to/spec.md \
  --artifact-type code_diff
# exit 0 = PASS/PASS_WITH_WARNINGS, 1 = REVISE/ESCALATE/BLOCK, 2 = usage error
```

Full API (Python port, hooks for Qwen Code's `PostToolUse`/`Stop`
events, the complete rule table) is in `~/work/seal-gate/USAGE.md`.

## Automated Task Execution — pilotfish

Steps 2-4 above can be automated for `apply`-role tasks: pilotfish reads
the next task, calls a model you configure, writes the result, runs the
test, retries with the failure fed back on error, and escalates (never
guesses past a limit) when `plan.json`'s own
`escalation.max_improvement_iterations` is exhausted.

### Config: `pilotfish.config.json`

Create this at your project root (or point `--config` at it elsewhere):

```json
{
  "roles": {
    "apply": "your-model-identifier"
  },
  "modelCommand": "your-command {model} --prompt-file {promptFile}",
  "testCommandTemplate": "bun test {test}"
}
```

- **`roles`** — maps a role name (currently only `apply` is driven by
  the loop) to an opaque model identifier. The identifier's meaning is
  entirely up to you and `modelCommand` — pilotfish never interprets it.
- **`modelCommand`** — **required** to actually call a model. Pilotfish
  does **not** hardcode or assume any specific provider/API (matches this
  colony's cost-discipline convention of never defaulting to a paid
  engine, and keeps pilotfish itself provider-agnostic). It writes the
  call's full context (role, model, task, attempt number, previous
  error if any) as JSON to a temp file, substitutes `{model}` and
  `{promptFile}` into your command, runs it, and expects
  `{"files": {"path/to/file": "full content", ...}}` printed to stdout.
  Wire this to whatever you actually use — a CLI wrapper around a real
  model API, a local model runner, anything that honors this contract.
- **`testCommandTemplate`** — defaults to `"bun test {test}"`. `{test}`
  is substituted with the task's `test` field from `plan.json`.

### Running it

```bash
pilotfish run loomkit/changes/my-feature TASK-1
# or: node ~/work/pilotfish/dist/cli.js run loomkit/changes/my-feature TASK-1
#   [--project-root <dir>]   defaults to cwd
#   [--config <path>]        defaults to <project-root>/pilotfish.config.json
#   [--role <role>]          defaults to "apply"
```

Prints a JSON result:
- `{"status": "already_complete"}` — task was already done, nothing ran.
- `{"status": "complete", "attempts": N}` — a passing attempt was found
  within the iteration limit. The task is **not** automatically marked
  complete in `plan.json` — run `loomkit plan-json complete ...` next
  (pilotfish deliberately doesn't duplicate loomkit's own, already-tested
  completion logic — hashing files, updating `plan.json` — it only
  proves a passing state was reached).
- `{"status": "escalate", "attempts": N, "reason": "...", "escalation": {...}}`
  — every attempt failed. Exit code 1. The CLI also prints the exact
  `hammerhead-debug open` command to run next, using the real captured
  failure as `--repro`'s evidence — **it does not auto-open a debug
  session for you**; that's a decision the CLI hands back rather than
  makes on your behalf.

## Windows Support

**Honest status: unverified end-to-end on a real Windows machine as of
this writing.** What's believed to work vs. what's flagged as unknown:

**Should work, no Windows-specific code exists:**
- All four CLIs (`loomkit`, `seal-gate` internals, `hammerhead-debug`,
  `pilotfish`) are plain Node.js (`#!/usr/bin/env node`), no OS-specific
  branches in their core logic.
- `pnpm`/`npm` generate a `.cmd` shim for `bin` entries on Windows
  automatically — `loomkit`, `hammerhead-debug`, `pilotfish` should be
  invocable the same way once installed.
- `file:../...` relative dependency resolution — standard pnpm/npm
  behavior, not expected to differ on Windows, but not tested there.
- hammerhead-debug's `install` command uses Node's `path.join`
  throughout (not string concatenation) — should produce correct
  Windows-style paths (`\` separators) without any code change needed.

**Confirmed friction points (real, from source inspection):**
- `loomkit plan-json complete --test-cmd "..."` and pilotfish's default
  test runner both shell out via `execFileSync('sh', ['-c', cmd], ...)`
  — **requires a POSIX `sh` on `PATH`**. Git Bash (bundled with Git for
  Windows) provides one; a bare `cmd.exe`/PowerShell-only environment
  does not. If a command fails with "sh not found" or similar, this is
  why — install Git for Windows (which most Windows dev setups already
  have) or otherwise ensure `sh` resolves.
- hammerhead-debug's **`dap` probe kind** (real breakpoints via the
  Debug Adapter Protocol) depends on an external Go binary
  (`~/work/debug-skill`'s `dap` CLI) — building that requires Go
  installed on Windows, and the underlying debugger backends
  (debugpy/dlv/js-debug/lldb-dap) each have their own Windows setup
  independent of this project. The **`instrumentation`/`isolated_test`/
  `trace_read`** probe kinds have no such dependency and should work
  identically on Windows — prefer those if `dap` setup is a blocker.
- pilotfish's `modelCommand` is itself run via `sh -c` too — same POSIX
  shell requirement applies to whatever real model-calling command you
  configure.

**If you hit something on Windows that contradicts the "should work"
claims above, that's a real bug to report/fix, not an assumption to
silently work around.**

## Escape Hatches

Every state-checked LoomKit command accepts `--skip-state-check` if
`phase.json` enforcement gets in the way during manual testing/
exploration — it warns loudly rather than failing silently, and is meant
for development, not routine use.

## Reference: full command list

### loomkit

Run `loomkit help` for the live list. As of this writing:

```
Workflow:  init, intent, spec, design, plan, show, verify, archive
Harness:   self-check, gate-code, craft, gate-pipeline, learn, plan-json
Other:     publish, status, adapt, help
```

`plan-json` sub-actions and their flags:

```
init:     --trace <INTENT-ID> --resolved-by <name>
add:      --id <id> --behavior "..." --acceptance "..." --files a.ts[,b.ts] --test tests/a.test.ts [--consumes path1[,path2]]
start:    <task-id> [--skip-state-check]
complete: <task-id> --test-cmd "<cmd>" [--debug-session <id> --debug-cycle <id> --root-cause "..."] [--escalated]
finish:   (no options) — closes phase.json's "apply" phase once all tasks are complete
show:     (no options)
```

### hammerhead-debug

```
hammerhead-debug install [--agent claude-code|codex] [--project]
hammerhead-debug open --symptom "<desc>" --repro "<cmd>" [--plan <p> --task <t>] [--dir <dir>]
hammerhead-debug hypothesis <session-id> "<hypothesis>" --predict "<prediction>" [--dir <dir>]
hammerhead-debug probe <session-id> --kind dap --break <path:line> --evaluate "<expr>" [--script <path>] [--dap-bin <path>] [--dir <dir>]
hammerhead-debug probe <session-id> --kind instrumentation|isolated_test|trace_read --observation "<captured evidence>" [--dir <dir>]
hammerhead-debug verdict <session-id> --result CONFIRMED|REFUTED [--reason "..."] [--dir <dir>]
hammerhead-debug fix <session-id> --diff-sha256 <hash> [--dir <dir>]
hammerhead-debug status <session-id> [--dir <dir>]
hammerhead-debug check <session-id> [--dir <dir>]
hammerhead-debug list [--dir <dir>]
```

`--dir` defaults to `.hammerhead-debug` relative to cwd — pass a
loomkit changeDir (`loomkit/changes/<name>` or `openspec/changes/<name>`)
to keep a debug session's evidence attached to the plan task it serves,
so `loomkit plan-json complete --debug-session ... --debug-cycle ...` can
find and verify it.

### pilotfish

```
pilotfish run <changeDir> <task-id> [--project-root <dir>] [--config <path>] [--role <role>]
```

## Design docs

The reasoning behind this workflow (why weak-model sizing matters, how
the hash-chain works, why mutation-probing exists, why pilotfish stays
provider-agnostic) lives in:
- `openspec/archive/loomkit-harness-complete-*/design.md`
- `openspec/changes/gate-code-mutation-probe/{intent,design}.md`
- `~/work/hammerhead-debug/openspec/changes/{extract-and-dap,dap-probe-via-debug-skill,debug-loop-skill-layer}/{intent,design}.md`
- `~/work/pilotfish/openspec/changes/{scaffold-role-orchestrator,role-orchestrator-loop}/intent.md`

Read those if you're modifying the harness itself, not just using it.
