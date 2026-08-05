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

Three packages work together:

| Package | Role | Repo |
|---|---|---|
| **LoomKit** (this repo) | Lifecycle, plan tasks, gate orchestration | `~/work/loomkit` |
| **seal-gate** | Verification: does the diff actually match the claim? | `~/work/seal-gate` |
| **hammerhead-debug** | Hypothesis-gated debugging (DAP or log evidence) when a task gets stuck | `~/work/hammerhead-debug` |

None of the three know about each other's internals — LoomKit calls into
seal-gate and hammerhead-debug as dependencies (`file:../seal-gate`,
`file:../hammerhead-debug` in `package.json`), the same way any consumer
would use a published package.

## Install / Build

```bash
# All three repos need to sit side by side (siblings), since LoomKit's
# package.json references the other two via relative file: paths.
cd ~/work/loomkit
pnpm install
pnpm build          # tsc — outputs dist/

cd ~/work/hammerhead-debug
npm install         # or pnpm install
npx tsc             # outputs dist/

cd ~/work/seal-gate
npm install
npx tsc             # (already built if you didn't touch it)
```

`loomkit` exposes a `bin` entry (`loomkit` → `dist/cli/index.js`), same
for `hammerhead-debug`. Once built, you can either:
- run them via their full path: `node ~/work/loomkit/dist/cli/index.js ...`
- or, from inside a project that has them installed as a dependency:
  `node_modules/.bin/loomkit ...`

**Windows note (unverified — flagging honestly, not tested on Windows):**
Both CLIs are plain Node.js scripts (`#!/usr/bin/env node` shebang) with
no OS-specific code in the LoomKit/hammerhead-debug core paths — `node
dist/cli/index.js ...` should work identically on Windows, macOS, and
Linux. `pnpm`/`npm` generate a `.cmd` shim for the `bin` entries on
Windows automatically. Things that are **not yet verified on Windows**:
- The `file:../seal-gate` / `file:../hammerhead-debug` relative
  dependency resolution — should work with pnpm/npm on Windows the same
  way, but hasn't been tested there.
- hammerhead-debug's **DAP probe kind** depends on an external Go binary
  (`~/repo/debug-skill`'s `dap` CLI) — building that on Windows requires
  Go installed, and the underlying debugger backends
  (debugpy/dlv/js-debug/lldb-dap) have their own Windows setup steps
  independent of this project. The **instrumentation/isolated_test/
  trace_read** probe kinds have no such dependency and should work
  identically on Windows.
- Shell-invoked commands inside `plan-json complete --test-cmd "..."`
  run via `sh -c` on the LoomKit side — on Windows this requires a POSIX
  shell on `PATH` (Git Bash ships one; a plain `cmd.exe`/PowerShell-only
  environment won't have `sh`). If commands fail with "sh not found,"
  this is why.

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
  file since it was produced).
- **gate-code**: run the SEAL quality gate against the current diff —
  produces a PASS/BLOCK verdict, a trust score, and (if `plan.json`
  tasks have tests) a mutation-probe pass confirming each test actually
  pins its behavior, not just asserts something true-by-construction.

## Step-by-Step Walkthrough

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
`~/work/hammerhead-debug/skill/SKILL.md` for the full guide):

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

## Escape Hatches

Every state-checked command accepts `--skip-state-check` if `phase.json`
enforcement gets in the way during manual testing/exploration — it warns
loudly rather than failing silently, and is meant for development, not
routine use.

## Reference: full command list

Run `loomkit help` for the live list. As of this writing:

```
Workflow:  init, intent, spec, design, plan, show, verify, archive
Harness:   self-check, gate-code, craft, gate-pipeline, learn, plan-json
Other:     publish, status, adapt, help
```

`plan-json` sub-actions: `init`, `add`, `start`, `complete`, `finish`,
`show`.

## Design docs

The reasoning behind this workflow (why weak-model sizing matters, how
the hash-chain works, why mutation-probing exists) lives in
`openspec/archive/loomkit-harness-complete-*/design.md` and
`openspec/changes/gate-code-mutation-probe/{intent,design}.md`. Read
those if you're modifying the harness itself, not just using it.
