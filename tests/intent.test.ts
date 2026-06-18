import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config/loader.js';

describe('Intent Config', () => {
  it('applies defaults when intent section is absent', () => {
    const config = loadConfig(null);
    expect(config.intent).toBeUndefined();
  });

  it('parses intent config with all fields', () => {
    const yaml = `intent:\n  enforce: true\n  require_approval_before_spec: true\n  require_no_blocking_ambiguities: true\n`;
    const config = loadConfig(yaml);
    expect(config.intent).toBeDefined();
    expect(config.intent!.enforce).toBe(true);
    expect(config.intent!.require_approval_before_spec).toBe(true);
    expect(config.intent!.require_no_blocking_ambiguities).toBe(true);
  });

  it('defaults intent.enforce to false', () => {
    const yaml = `intent:\n  foo: bar\n`;
    const config = loadConfig(yaml);
    expect(config.intent).toBeDefined();
    expect(config.intent!.enforce).toBe(false);
  });

  it('defaults require_approval_before_spec to false', () => {
    const yaml = `intent:\n  enforce: true\n`;
    const config = loadConfig(yaml);
    expect(config.intent!.require_approval_before_spec).toBe(false);
  });

  it('defaults require_no_blocking_ambiguities to false', () => {
    const yaml = `intent:\n  enforce: true\n`;
    const config = loadConfig(yaml);
    expect(config.intent!.require_no_blocking_ambiguities).toBe(false);
  });
});

describe('Workflow Schema — Intent Artifact', () => {
  it('intent artifact is defined in schema', () => {
    // Verify the schema YAML defines intent as the first artifact
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(
      __dirname,
      '..',
      'schemas',
      'spec-driven',
      'schema.yaml',
    );
    const schemaYaml = fs.readFileSync(schemaPath, 'utf-8');
    expect(schemaYaml).toContain('id: intent');
    expect(schemaYaml).toContain('generates: intent.md');
    expect(schemaYaml).toContain('Intent-guided');
  });

  it('intent template exists', () => {
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(
      __dirname,
      '..',
      'schemas',
      'spec-driven',
      'templates',
      'intent.md',
    );
    expect(fs.existsSync(templatePath)).toBe(true);
    const content = fs.readFileSync(templatePath, 'utf-8');
    expect(content).toContain('# Intent:');
    expect(content).toContain('## Raw Request');
    expect(content).toContain('## Problem');
    expect(content).toContain('## Desired Outcome');
    expect(content).toContain('## Non-Goals');
    expect(content).toContain('## Spec Seeds');
    expect(content).toContain('## Intent Approval');
    expect(content).toContain('Status: DRAFT');
  });
});

describe('Intent Skill', () => {
  it('intent SKILL.md exists', () => {
    const fs = require('fs');
    const path = require('path');
    const skillPath = path.join(
      __dirname,
      '..',
      'skills',
      'intent',
      'SKILL.md',
    );
    expect(fs.existsSync(skillPath)).toBe(true);
    const content = fs.readFileSync(skillPath, 'utf-8');
    expect(content).toContain('name: intent');
    expect(content).toContain('Intent artifact');
    expect(content).toContain('separate the user\'s desired outcome');
    expect(content).toContain('Status: DRAFT');
  });
});
