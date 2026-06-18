---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Agents

## Overview

When implementation involves multiple independent workstreams, dispatch them in parallel. Each agent works on its own scope with no coordination overhead. Collect results, integrate, verify.

## When to Use

- 2+ tasks in the plan touch completely separate files
- Research phase: exploring multiple approaches simultaneously
- Verification phase: independent review agents checking different aspects
- Cross-cutting: one agent on frontend, one on backend, one on tests
- Any time wall-clock time matters more than token cost

## Instructions

1. **Identify parallelizable work.** Scan tasks.md. Tasks are parallelizable if:
   - They touch completely disjoint file sets
   - Task B does not import or depend on code Task A is writing
   - They can be integrated after both complete without conflicts

2. **Dispatch in one batch.** Send all parallel agents simultaneously:
   - Each agent gets: exact task description + relevant file context
   - Agents do NOT communicate with each other
   - Each agent works in isolation and returns results independently

3. **Collect results.** When all agents complete:
   - Filter out failures (null results)
   - Review each agent's changes independently
   - Run the full test suite

4. **Integrate.** If all agents succeeded:
   - All changes are already on disk (filesystem is shared state)
   - Run integration tests
   - Fix any merge conflicts
   - Commit the combined result

5. **Handle failures.** If any agent fails:
   - Other agents' work is preserved (files on disk)
   - Re-dispatch only the failed task
   - If same task fails 3 times, investigate manually

## Rules

- Only dispatch in parallel what is truly independent
- Shared files = cannot parallelize
- Maximum 5 parallel agents unless explicitly approved
- Always run full test suite after parallel dispatch, before claiming success
- Never dispatch agents that modify the same file
