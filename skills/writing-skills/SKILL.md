---
name: writing-skills
description: Use when creating new LoomKit skills, editing existing skills, or verifying skills follow the standard format before deployment
---

# Writing Skills

## Overview

Create or edit LoomKit SKILL.md files following the standard format. Every skill must have frontmatter, clear trigger conditions, step-by-step instructions, and concrete deliverable.

## When to Use

- Adding a new phase to the LoomKit workflow
- Improving existing skill instructions
- Verifying a skill follows the standard before archiving
- Adapting a superpowers skill to LoomKit format

## Skill Format

Every SKILL.md must have:

```markdown
---
name: <skill-name>
description: Use when <trigger condition>
---

# <Skill Title>

## Overview
<One paragraph describing what this skill does>

## When to Use
<Specific trigger conditions>

## Instructions
<Numbered steps with exact actions>

## Rules
<Non-negotiable constraints>
```

## Rules for Writing Skills

1. **Frontmatter is mandatory.** The YAML `---` block with `name` and `description` is how agents discover and trigger skills.
2. **Description must include trigger conditions.** "Use when..." not "This skill does X".
3. **Instructions must be actionable.** Every step starts with a verb: Read, Write, Run, Check, Verify.
4. **No placeholders.** Every step has exact content. No "TBD" or "implement later".
5. **Keep it focused.** One skill = one phase. If a skill does two things, split it.
6. **Rules are non-negotiable.** They define what the agent MUST and MUST NOT do.
7. **Deliverable must be concrete.** The skill must produce a specific artifact or outcome.

## Self-Review Checklist

After writing a skill, verify:
- [ ] Frontmatter has name + description with trigger conditions
- [ ] Overview is one paragraph
- [ ] When to Use lists specific triggers
- [ ] Instructions are numbered, start with verbs
- [ ] No placeholders or TBD
- [ ] Rules section defines constraints
- [ ] The skill produces a concrete deliverable
- [ ] The skill doesn't overlap with an existing skill's scope
