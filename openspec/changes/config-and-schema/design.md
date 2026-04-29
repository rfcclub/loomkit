# Design: Config & Schema System

## Approach
YAML config parsed with `yaml` package, validated with Zod, env var substitution via regex. Schema system mirrors OpenSpec's schema.yaml format — artifact definitions with templates and instructions.

## Config Schema (Zod)
```typescript
const LoomKitConfigSchema = z.object({
  schema: z.enum(["spec-driven"]).default("spec-driven"),
  tdd: z.object({
    framework: z.enum(["vitest", "jest", "pytest", "xunit", "custom"]).default("vitest"),
    enforce: z.boolean().default(true),
    coverage_threshold: z.number().int().min(0).max(100).default(100),
    command: z.string().optional(),
  }).default({}),
  context: z.string().default(""),
  rules: z.record(z.array(z.string())).default({}),
});
```

## Schema Format (from OpenSpec)
```yaml
# loomkit/schemas/spec-driven/schema.yaml
name: spec-driven
version: 1
description: LoomKit spec-driven workflow with TDD
artifacts:
  - id: brainstorm
    generates: proposal.md
    description: Socratic dialogue to refine idea into proposal
    template: proposal.md
    instruction: |
      [brainstorm instructions from Superpowers]
    requires: []

  - id: specs
    generates: "specs/**/*.md"
    description: Requirements-as-code with WHEN/THEN scenarios
    template: spec.md
    instruction: |
      [spec instructions from OpenSpec + LoomKit additions]
    requires: [proposal]

  - id: design
    generates: design.md
    description: Technical design with test strategy
    template: design.md
    instruction: |
      [design instructions from OpenSpec + Superpowers]
    requires: [proposal]

  - id: tasks
    generates: tasks.md
    description: Bite-sized TDD implementation plan
    template: tasks.md
    instruction: |
      [plan instructions from Superpowers writing-plans]
    requires: [specs, design]

apply:
  requires: [tasks]
  tracks: tasks.md
  instruction: |
    [TDD cycle from Superpowers + verify from LoomKit]
```

## File Layout
```
loomkit/src/config/
  schema.ts          — Zod config schema
  loader.ts          — load + validate + env substitution
  defaults.ts        — default values

loomkit/src/schema/
  loader.ts          — load schema.yaml
  artifacts.ts       — artifact definitions, templates, dependency resolution
  templates.ts       — template rendering with context + rules injection
```

## Template Directory
```
loomkit/schemas/spec-driven/
  schema.yaml
  templates/
    proposal.md
    spec.md
    design.md
    tasks.md
```

## Rollback
Config is read-only at runtime. Schema is static (loaded from file). Bad config = early error.
