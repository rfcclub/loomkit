---
name: brainstorm
description: Use when starting a new feature or change, before writing any specs or code — explores context, constraints, and approaches
---

# Brainstorm

## Overview

Socratic dialogue that explores the problem space before committing to any solution. One question at a time. Ends with a concrete proposal document.

**Hard gate:** Do not write any spec, design, plan, or code until the proposal is written and approved.

## When to Use

- Starting a new feature or capability
- Exploring a user request that needs scoping
- Before any spec/design work begins
- When there's ambiguity about what to build

**Do NOT use:** For trivial bug fixes, config changes, or anything where the what/why is already fully understood.

## Instructions

### 1. Explore Project Context

Read the project's relevant files:
- `loomkit/specs/` — living specs (existing capabilities)
- `loomkit/config.yaml` — project config and rules
- `loomkit/changes/` — any active in-progress changes
- Any user-provided context

### 2. Ask Clarifying Questions

Ask one question at a time. Each message contains exactly one question.

Explore in this order:
1. **Problem** — What is the actual problem? Why now?
2. **Constraints** — Technical, business, timeline, compatibility constraints
3. **Existing solutions** — How is this handled today? What's missing?
4. **Scope** — Is this one coherent change, or should it be decomposed?

Prefer multiple-choice questions when possible. Do not ask more than one question per message — if a topic needs more exploration, break it into sequential questions.

### 3. Propose 2-3 Approaches

Once you understand the problem, present 2-3 distinct approaches. For each approach include:
- **Idea** — What it is in one sentence
- **Trade-offs** — Pros and cons
- **Risks** — What could go wrong

Lead with your recommended approach and explain why.

Present approaches conversationally. Wait for user feedback before proceeding.

### 4. Write proposal.md

After approaches are discussed and approved, write `proposal.md` in the change directory:

`loomkit/changes/<change-name>/proposal.md`

Use the template from `loomkit/schemas/spec-driven/templates/proposal.md`:

```markdown
## Why

<!-- What problem does this solve? Why now? 1-2 sentences. -->

## What Changes

<!-- Bullet list of changes. Mark breaking changes with **BREAKING**. -->

## Capabilities

### New Capabilities
<!-- Each becomes specs/<name>/spec.md. Use kebab-case. -->
- `<name>`: <brief description>

### Modified Capabilities
<!-- Existing specs whose REQUIREMENTS change. Leave empty if none. -->
- `<existing-name>`: <what requirement is changing>

## Impact

<!-- Affected code, APIs, dependencies, systems -->
```

## Output

- `loomkit/changes/<change-name>/proposal.md`

## Validation

- [ ] Proposal has a clear "Why" section (problem statement)
- [ ] Every new capability is listed with a kebab-case name
- [ ] Every modified capability is listed (or section left empty)
- [ ] Impact section covers affected code/systems
- [ ] No implementation details — proposal answers WHAT and WHY, not HOW

## Anti-Patterns

- Asking multiple questions in one message
- Jumping to solutions before understanding the problem
- Proposing only one approach (always offer alternatives)
- Writing vague capabilities ("improve performance" without specifics)
- Skipping the proposal doc and going straight to specs
- Including HOW details (implementation) in the proposal — that's for design phase
- Assuming scope without exploring constraints
