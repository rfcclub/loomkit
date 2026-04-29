---
name: verify
description: Use when checking scenario coverage, running test suite, and producing .loomkit-verify.json gate output
---

# Verify

## Overview

Check that all SHALL/MUST scenarios have passing tests, run the test suite, and produce a verified coverage gate report.

## When to Use

- Before archive — verify gate must pass
- After all TDD tasks for a change are complete
- When checking coverage status mid-implementation
- `/lk:verify` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Check scenario coverage:**
   - Read spec scenarios from `changes/<name>/specs/<capability>/spec.md`
   - Read `.traceability.yaml` for test mappings
   - Identify SHALL/MUST scenarios (mandatory for gate)
   - Identify uncovered mandatory scenarios → FAIL
2. **Run test suite:** `npx vitest run` (or configured framework)
   - All tests pass? → proceed
   - Any failures? → FAIL, report which test(s)
3. **Generate coverage report:**
   - Per scenario: status (pass/fail/untested)
   - Overall coverage percentage
   - Gate: pass/fail
4. **Write `.loomkit-verify.json`** in `changes/<name>/`:
   ```json
   {
     "change": "<name>",
     "timestamp": "<ISO-8601>",
     "coverage": {
       "mandatory": 10,
       "covered": 10,
       "untested": 0,
       "percent": 100
     },
     "tests": {
       "total": 15,
       "passed": 15,
       "failed": 0
     },
     "gate": "pass"
   }
   ```

## Output

- `.loomkit-verify.json` in change directory

## Validation

- Is the JSON well-formed?
- Are mandatory scenarios calculated correctly (SHALL/MUST only)?
- Gate = pass only if all mandatory covered AND all tests pass
- Timestamp is valid ISO-8601

## Anti-Patterns

- Including optional scenarios in mandatory coverage count
- Reporting gate=pass when tests fail
- Not reading the actual spec (hardcoded coverage numbers)
- Skipping traceability check
