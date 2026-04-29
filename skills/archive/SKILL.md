---
name: archive
description: Use when merging a verified change into living specs after passing coverage gate
---

# Archive

## Overview

Gate: verify must pass (or force with documented reason). Merge delta specs into living specs, move change to archive, record metadata.

## When to Use

- After verify passes — change is complete, merge into living specs
- When force-archiving a change with known gaps (with reason)
- `/lk:archive` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Gate check:**
   - Read `.loomkit-verify.json` from change directory
   - If `gate === "pass"` → proceed
   - If `gate !== "pass"` → require explicit force with reason (write to `.force-reason.md`)
2. **Delta spec → living spec merge:**
   - Read change specs from `changes/<name>/specs/`
   - Read living specs from `specs/`
   - Apply delta operations (ADDED/MODIFIED/REMOVED/RENAMED)
   - Write merged result back to living specs
3. **Archive metadata:**
   - Write metadata to `archive/<name>/metadata.yaml`:
     ```yaml
     name: <change name>
     archived: <ISO-8601>
     verify: pass|force
     force_reason: <optional>
     scenarios_in: <count>
     scenarios_out: <count>
     ```
4. **Move change:**
   - `mv changes/<name> archive/<name>/`

## Output

- Merged living specs in `specs/`
- `archive/<name>/metadata.yaml`
- `archive/<name>/` containing the full change

## Validation

- Verify gate passed (or force reason documented)
- Living specs contain merged content (no duplicates)
- No leftover `changes/<name>/` dir
- Metadata is present and populated

## Anti-Patterns

- Skipping verify gate
- Force-archiving without documented reason
- Leaving old spec fragments in living specs
- Moving change without merging delta (data loss)
- Not updating `.traceability.yaml` for archived changes
