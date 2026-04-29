---
name: brainstorm
description: Use when exploring a new feature or problem space, generating approaches, and producing a proposal.md
---

# Brainstorm

## Overview

Socratic dialogue to explore a problem space, generate 2-3 approaches, weigh trade-offs, and produce a written proposal.

## When to Use

- Starting a new feature or capability
- Problem space is unclear or has multiple possible solutions
- Before writing formal specs — explore first
- `/lk:brainstorm` in Claude Code; equivalent trigger in other tools

## Instructions

1. **Establish context.** Ask one question at a time (Socratic):
   - What problem are we solving?
   - What are the constraints? (time, platform, existing code, performance)
   - Who are the users? What outcomes matter?
   - What existing solutions exist (in this project or elsewhere)?
2. **Generate 2-3 approaches minimum.** For each:
   - Summarise the idea in one sentence
   - List trade-offs (pros/cons)
   - Identify risks (technical debt, complexity, integration)
3. **Synthesise into a recommendation.** Which approach best balances the constraints? Why?
4. **Write `proposal.md`** with:
   - **Motivation** — why change is needed
   - **What changes** — high-level scope
   - **Capabilities** — what the system can do after
   - **Non-goals** — explicitly excluded

## Output

- `proposal.md` in `changes/<name>/proposal.md` (or standalone if no change set yet)

## Validation

- Contains Motivation, What changes, Capabilities, Non-goals
- Each section is substantive (not 1-line)
- At least 2 approaches presented before recommendation
- No open questions left unanswered

## Anti-Patterns

- Asking multiple questions at once (keep Socratic: one at a time)
- Jumping to one solution without exploring alternatives
- Vague non-goals like "not a complete redesign" — be specific
- Including implementation details (that's for design/plan)
