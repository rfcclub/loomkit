---
name: intent
description: Use when capturing the problem, desired outcome, non-goals, and constraints for a change before writing any spec or code — separates outcome from solution
---

# Intent

## Overview

Transform a raw user request into an Intent artifact before any specification is written. The Intent layer protects against the most common agent failure mode: treating a user's proposed solution as the actual requirement.

## When to Use

- Starting ANY new change — intent must exist before spec
- User request contains a solution description — must separate outcome from solution
- Problem space has ambiguity that could derail implementation
- `/lk:intent` in Claude Code; equivalent trigger in other tools

## Rules

You must not write code.
You must not create implementation tasks.
You must not write final requirements yet.
You must separate the user's desired outcome from the user's proposed solution.

## Instructions

1. **Read the raw request.** Capture it verbatim in the intent.md.

2. **Separate outcome from solution.** If the user said "Add Redis cache to product API":
   - **Problem**: Product API latency is too high
   - **Desired Outcome**: Reduce p95 latency for product reads without serving unsafe stale data
   - **Proposed Direction**: Redis cache (not yet a requirement)
   Treat the raw request as evidence, not as a complete specification.

3. **Identify what's excluded.** Users often don't say what NOT to build. Infer from context:
   - What would be a natural scope creep risk?
   - What adjacent systems should not be touched?
   - Every Non-Goal prevents future feature creep.

4. **Surface hidden implications.** Detect:
   - Security: Does this expose data? Change auth boundaries?
   - Data: Does this change persistence? Migration needed?
   - Compatibility: Does this break existing behavior?
   - Testing: What would make this hard to verify?

5. **Classify ambiguity.** Two levels:
   - **Blocking**: Cannot proceed without resolution. Must be resolved before spec/design.
   - **Non-Blocking**: Can proceed with a documented assumption.
   Mark dangerous uncertainty as BLOCKING. Do not hide it.

6. **Write Spec Seeds.** Candidate requirements derived from:
   - Desired Outcome → what must the system do?
   - Constraints → what must the system not do?
   - Risks → what must be defended against?
   - Success Criteria → how do we know it worked?
   Every Spec Seed must trace back to one of these sources. Do not invent requirements unsupported by the intent.

7. **Set status to DRAFT.** Only the human can approve. Default is DRAFT.

## Deliverable

Produce `loomkit/changes/<name>/intent.md` with all sections filled. Blank sections are acceptable if genuinely not applicable — mark as `<!-- None -->`. Empty sections with no marker mean "not yet explored" and block approval.

The intent.md header must include:
```
Status: DRAFT
```

Only the human can promote to `Status: APPROVED`.

## Intent Approval

After writing, present the intent to the human for review. Status must be updated to APPROVED before spec phase. A DRAFT intent blocks spec in strict mode (configurable).
