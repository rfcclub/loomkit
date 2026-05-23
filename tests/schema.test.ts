import { describe, it, expect } from 'vitest';
import { loadSchema, type WorkflowSchema, type ArtifactDef } from '../src/schema/loader.js';

describe('Schema Loader', () => {
  it('loads spec-driven schema with artifacts and templates', () => {
    const yaml = `
name: spec-driven
version: 1
description: Default LoomKit workflow
artifacts:
  - id: proposal
    generates: proposal.md
    description: Initial proposal
    template: proposal.md
  - id: spec
    generates: spec.md
    description: Living specification
    template: spec.md
  - id: design
    generates: design.md
    description: Technical design
    template: design.md
  - id: tasks
    generates: tasks.md
    description: TDD implementation plan
    template: tasks.md
apply:
  - from: proposal
    to: spec
  - from: spec
    to: design
`;
    const schema = loadSchema(yaml);
    expect(schema.name).toBe('spec-driven');
    expect(schema.version).toBe(1);
    expect(schema.artifacts).toHaveLength(4);
    expect(schema.artifacts[0].id).toBe('proposal');
    expect(schema.apply).toHaveLength(2);
  });

  it('fails on missing required fields', () => {
    const yaml = `
name: incomplete
version: 1
`;
    expect(() => loadSchema(yaml)).toThrow(/artifacts/);
  });

  it('fails on duplicate artifact ids', () => {
    const yaml = `
name: dupes
version: 1
artifacts:
  - id: proposal
    generates: proposal.md
    description: First
  - id: proposal
    generates: proposal.md
    description: Duplicate
`;
    expect(() => loadSchema(yaml)).toThrow(/duplicate/);
  });

  it('resolves template path relative to schema dir', () => {
    const yaml = `
name: test
version: 1
artifacts:
  - id: spec
    generates: spec.md
    description: Spec
    template: spec.md
`;
    const schema = loadSchema(yaml, '/schemas/test');
    expect(schema.artifacts[0].templatePath).toBe('/schemas/test/templates/spec.md');
  });

  it('loads workspace-planning schema with apply phase object (compatible with OpenSpec)', () => {
    const yaml = `
name: workspace-planning
version: 1
description: Workspace planning workflow for cross-area changes
artifacts:
  - id: proposal
    generates: proposal.md
    description: Shared workspace proposal
    template: proposal.md
  - id: specs
    generates: "specs/**/*.md"
    description: Workspace-scoped specs
    template: spec.md
  - id: design
    generates: design.md
    description: Cross-area technical design
    template: design.md
  - id: tasks
    generates: tasks.md
    description: Workspace coordination tasks
    template: tasks.md
apply:
  requires:
    - tasks
  tracks: tasks.md
  instruction: "Read the workspace planning context."
`;
    const schema = loadSchema(yaml);
    expect(schema.name).toBe('workspace-planning');
    expect(schema.version).toBe(1);
    expect(schema.artifacts).toHaveLength(4);
    
    // Verify it parses the polymorphic apply object
    const apply = schema.apply as any;
    expect(apply).toBeDefined();
    expect(apply.requires).toContain('tasks');
    expect(apply.tracks).toBe('tasks.md');
    expect(apply.instruction).toBe('Read the workspace planning context.');
  });
});
