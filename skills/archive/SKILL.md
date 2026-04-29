---
name: archive
description: Use when verification passes — merges the delta spec into living specs and records the change as completed
---

# Archive

## Overview

The final phase of a change. Verifies the change is complete (or forces through with documented reason), merges delta spec changes into living specs, and records archive metadata. After archiving, the change is considered complete and its implementation specs become part of the permanent specification.

## When to Use

- After verify phase passes (`passed: true` in `.loomkit-verify.json`)
- When a change must be archived despite verification failure (with force reason)
- Only once per change — do not re-archive already archived changes

## Instructions

### 1. Check Verification Status

Read `loomkit/changes/<change-name>/.loomkit-verify.json`.

**If `passed: true`** — proceed to merge.
**If `passed: false`** — either:
  - Return to implementation and fix the issues
  - Or force archive with explicit reason

#### Force Archive

Only use force when verification failure is understood and acceptable. Write a force reason:

```markdown
**Force archive reason:**
- <specific issue preventing verification>
- <why this is acceptable>
- <planned remediation if any>
```

Example force reasons:
- "Test infrastructure not available in this environment"
- "Scenarios cover manual verification steps that cannot be automated"
- "Coverage threshold set higher than achievable given current test tooling"

**Never** force archive for: untested code, failing tests, or ignored mandatory scenarios without valid reason.

### 2. Merge Delta Specs into Living Specs

Read delta spec files from `loomkit/changes/<change-name>/specs/`:

Apply each operation:

| Delta Operation | Action on Living Spec |
|----------------|----------------------|
| `## ADDED Requirements` | Append to corresponding `specs/<capability>/spec.md` |
| `## MODIFIED Requirements` | Update the existing requirement in `specs/<capability>/spec.md` |
| `## REMOVED Requirements` | Remove the requirement from `specs/<capability>/spec.md` |
| `## RENAMED Requirements` | Rename the requirement in `specs/<capability>/spec.md` |

For new capabilities (no existing living spec), create `loomkit/specs/<capability>/spec.md` with the delta content.

For existing capabilities, merge the delta into the existing living spec.

**Merge rules:**
- ADDED requirements are appended to the end of the relevant requirement group
- MODIFIED requirements replace the old text in-place
- REMOVED requirements are deleted (with a comment `<!-- removed YYYY-MM-DD: <change-name> -->`)
- RENAMED requirements update their heading text
- Preserve all unchanged content from the living spec
- Do not modify requirements unrelated to this change

### 3. Write Archive Metadata

Write to `loomkit/archive/<change-name>/archive.json`:

```json
{
  "change": "<change-name>",
  "archived_at": "2026-04-29T07:57:00.000Z",
  "verification": {
    "passed": true,
    "coverage_percent": 100,
    "force": false
  },
  "specs_affected": [
    "specs/<capability>/spec.md"
  ],
  "summary": "Added <n> requirements, modified <m>, removed <r>",
  "force_reason": null
}
```

If force archive was used, include the force reason:

```json
{
  "force": true,
  "force_reason": "Test infrastructure not available in this environment"
}
```

### 4. Clean Up (Optional)

After successful archive, the change directory can be cleaned:
- Remove `loomkit/changes/<change-name>/` (or keep for history)
- All relevant content is now in `loomkit/specs/` and `loomkit/archive/`

## Output

- Updated/created files in `loomkit/specs/` (merged living specs)
- `loomkit/archive/<change-name>/archive.json` (archive metadata)

## Validation

- [ ] Live specs in `loomkit/specs/` contain all ADDED requirements
- [ ] MODIFIED requirements are updated, not duplicated
- [ ] REMOVED requirements are absent (or marked with comment)
- [ ] RENAMED requirements have the new name
- [ ] Archive metadata JSON is valid
- [ ] `verification.passed` matches the verify result
- [ ] `archived_at` timestamp is current
- [ ] No living spec was modified for requirements not in the change
- [ ] If force archive, `force_reason` is present and meaningful

## Anti-Patterns

- Archiving without running verify first
- Force archiving without documenting the reason
- Merging specs that contradict existing living specs (without MODIFIED operation)
- Modifying living spec files that are not part of this change
- Forgetting to update living specs when modifying existing capabilities
- Duplicating requirements (ADDED was already in living spec)
- Not updating the archive metadata after merge
- Re-archiving an already-archived change
- Archiving SHOULD/MAY-only changes — verify gate only checks SHALL/MUST, but all scenarios become part of living spec
