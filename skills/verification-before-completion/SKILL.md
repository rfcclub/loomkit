---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing — requires running verification commands and confirming output before making any success claims
---

# Verification Before Completion

## Overview

NEVER claim something is done without evidence. Run the verification commands, read the output, confirm it passes. Evidence before assertions, always.

## When to Use

- Before marking a task `[x]` in tasks.md
- Before running `loomkit verify`
- Before claiming a bug is fixed
- Before committing with "fixes" or "completes" in the message
- Before telling a human "it's done"

## Instructions

1. **Identify what "done" means.** Before starting, know:
   - What test(s) must pass?
   - What command proves it works?
   - What output confirms success?

2. **Run the verification command.** Execute the actual command:
   ```bash
   npx vitest run          # or configured test framework
   npx tsc --noEmit        # if TypeScript
   ```
   Do NOT assume tests pass. Do NOT rely on memory of a previous run.

3. **Read the output.** Scan every line:
   - All tests green? → proceed
   - Any failures? → STOP, do not claim success
   - Warnings? → assess, document if benign

4. **Check side effects.** Beyond tests:
   - Does the build still work?
   - Are there new lint errors?
   - Did you break any dependent modules?

5. **Document the evidence.** In your commit message or task update:
   - What command you ran
   - What the result was
   - Example: `Verified: 65 tests pass, tsc clean`

6. **Only then claim completion.** Mark the task done, tell the human, or commit.

## Anti-Patterns (NEVER do these)

- "Tests should pass" — run them
- "I think it works" — verify
- "The last run was green" — run again, code changed
- "It's a simple change" — simple changes break things too
- Skipping verification because you're confident — confidence is not evidence

## When Verification Fails

1. Do NOT mark the task complete
2. Do NOT commit with "done" or "fixed"
3. Diagnose the failure (use systematic-debugging if needed)
4. Fix, then re-verify from step 1
5. Only mark complete after a clean verification run
