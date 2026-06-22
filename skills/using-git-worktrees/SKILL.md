---
name: using-git-worktrees
description: Use when starting feature work needing isolation from current workspace — creates an isolated worktree via native tool or git fallback
---

# Using Git Worktrees

## Overview

Ensure work happens in an isolated workspace. Prefer the platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

## When to Use

- Starting a new feature branch
- Before executing an implementation plan
- When the current branch must remain clean
- `/lk:worktree` in Claude Code; equivalent trigger in other tools

## Instructions

### Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Before concluding "already in a worktree," verify you are not in a submodule:

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree. Skip to Step 2. Report with branch state.

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** You are in a normal repo checkout. Proceed to Step 1.

### Step 1: Create Isolated Workspace

**Try mechanisms in this order.**

#### 1a. Native Worktree Tools (preferred)

If the platform provides a native worktree mechanism (command, flag, tool), use it and skip to Step 2.

Native tools handle directory placement, branch creation, and cleanup automatically. Using `git worktree add` when you have a native tool creates phantom state your platform can't manage.

Only proceed to Step 1b if no native worktree tool is available.

#### 1b. Git Worktree Fallback

**Only if Step 1a does not apply.**

**Directory Selection:**
1. Check instructions for a declared worktree directory preference
2. Check for existing project-local worktree directory:
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred
   ls -d worktrees 2>/dev/null      # Alternative
   ```
3. Default to `.worktrees/` at the project root

**Safety Verification:**
```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```
**If NOT ignored:** Add to .gitignore, commit, then proceed. Prevents accidentally committing worktree contents.

**Create the Worktree:**
```bash
path="$LOCATION/$BRANCH_NAME"
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** If `git worktree add` fails with a permission error, work in the current directory instead.

### Step 2: Project Setup

Auto-detect and run appropriate setup:
```bash
# Node.js
if [ -f package.json ]; then npm install; fi
# Rust
if [ -f Cargo.toml ]; then cargo build; fi
# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi
# Go
if [ -f go.mod ]; then go mod download; fi
```

### Step 3: Verify Clean Baseline

Run tests to ensure workspace starts clean:
```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.
**If tests pass:** Report ready.

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Directory not ignored | Add to .gitignore + commit |
| Permission error on create | Work in place |
| Tests fail during baseline | Report + ask |
| No package manifest | Skip dependency install |

## Red Flags

**Never:**
- Create a worktree when Step 0 detects existing isolation
- Use `git worktree add` when a native worktree tool exists
- Skip ignore verification for project-local worktrees
- Skip baseline test verification
- Proceed with failing tests without asking

**Always:**
- Run Step 0 detection first
- Prefer native tools over git fallback
- Follow directory priority: instructions > existing directory > default
- Verify directory is ignored (project-local)
- Auto-detect and run project setup
- Verify clean test baseline
