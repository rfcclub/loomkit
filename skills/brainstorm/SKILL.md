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
2. **Offer the visual companion just-in-time** — NOT upfront. The first time a question would genuinely be clearer shown than described, offer it then (its own message); on approval, start the server and push a screen. If no visual question ever arises, never offer it. See [Visual Companion](#visual-companion) below.
3. **Generate 2-3 approaches minimum.** For each:
   - Summarise the idea in one sentence
   - List trade-offs (pros/cons)
   - Identify risks (technical debt, complexity, integration)
4. **Synthesise into a recommendation.** Which approach best balances the constraints? Why?
5. **Write `proposal.md`** with:
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

## Visual Companion

When a question would be clearer shown than described (UI mockups, architecture diagrams, side-by-side comparisons), offer to start the **Visual Companion** — a browser-based tool that shows interactive HTML mockups.

**Just-in-time, not upfront:** Do NOT offer it at the start of brainstorming. Wait until a visual question naturally arises, then ask: "I can show this in the browser — want me to start the visual companion?"

On approval, start the server and follow the full guide at `visual-companion.md`:

```bash
scripts/start-server.sh --project-dir <project-root> --open
```

The server returns a URL, `screen_dir`, and `state_dir`. Write HTML content fragments to `screen_dir`, the user sees them in the browser and can click to select options. Read `state_dir/events` on your next turn.

See `visual-companion.md` for full details: writing content, CSS classes, browser events, cleaning up.
