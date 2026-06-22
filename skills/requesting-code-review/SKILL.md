---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging — dispatches a reviewer subagent to catch issues early
---

# Requesting Code Review

## Overview

Dispatch a code reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context — never your session's history. This keeps the reviewer focused on the work product, not your thought process.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main
- `/lk:review` in Claude Code; equivalent trigger in other tools

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## Instructions

### 1. Capture the Range

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

### 2. Dispatch a Reviewer Subagent

Dispatch a review subagent with these details:

- **DESCRIPTION:** Brief summary of what was built
- **REQUIREMENTS:** What the code should do (link spec or plan)
- **BASE_SHA:** Starting commit
- **HEAD_SHA:** Ending commit

The reviewer examines the diff between BASE_SHA and HEAD_SHA for correctness, security, test coverage, and spec compliance.

### 3. Act on Feedback

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with technical reasoning)

### Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

### Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

## Output

- Reviewer subagent report
- Fixed issues based on feedback
- Updated commit with review-driven changes
