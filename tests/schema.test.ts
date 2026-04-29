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
});
