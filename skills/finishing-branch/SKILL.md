---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work — guides completion with structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Implementation is done and verified. Now decide how to integrate: merge, PR, keep for later, or discard. Present options clearly with trade-offs.

## When to Use

- After all tasks in tasks.md are `[x]`
- After `loomkit verify` passes
- Before archiving the change
- When the human asks "what now?" after implementation

## Instructions

1. **Confirm completion.** Before presenting options:
   - All tasks marked `[x]`
   - `loomkit verify <name>` passed
   - No uncommitted changes (or only intentional ones)
   - Build is clean

2. **Present structured options:**

   **Option A: Merge directly**
   - Squash-merge into main/master
   - Clean history, one commit for the feature
   - Best for: small-to-medium changes, solo development

   **Option B: Create a PR**
   - Push branch, open pull request
   - Enables review, CI checks, discussion
   - Best for: collaborative work, large changes, when review is required

   **Option C: Keep branch**
   - Leave the branch as-is, do not merge yet
   - Useful when: waiting on dependencies, needs integration testing, staging deployment
   - Document why it's kept and what unblocks it

   **Option D: Discard**
   - The change was exploratory or superseded
   - Archive the loomkit change to `archive/` but don't merge code
   - Close without merging

3. **Execute the chosen option.** For merge/PR:
   - Ensure branch is rebased on latest main
   - Run final verification
   - Merge or create PR
   - Archive the loomkit change: `loomkit archive <name>`

4. **Clean up.** After merge:
   - Delete the feature branch (local + remote)
   - Verify the loomkit change is in `archive/`
   - Update any related issues or tracking

## Rules

- Never merge without verification passing
- Never discard a branch with unarchived loomkit changes
- Present options, don't choose without asking (unless the human has given standing instructions)
