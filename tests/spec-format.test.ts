import { describe, it, expect } from 'vitest';
import { parseSpec } from '../src/spec/parser.js';
import { validateSpec } from '../src/spec/validator.js';
import { parseAssertion } from '../src/spec/assertion.js';
import { parseDeltaSpec } from '../src/spec/delta.js';
import { mergeSpecs } from '../src/spec/delta.js';

describe('Spec Parser', () => {
  it('parses a valid spec with title, purpose, and requirements', () => {
    const markdown = `# Auth Specification

## Purpose
Authentication and session management.

## Requirements

### Requirement: User Authentication
The system SHALL issue a JWT token upon successful login.

#### Scenario: Valid credentials
- **WHEN** user submits valid email + password
- **THEN** response.status = 200
- **AND** response.body.token is a valid JWT

#### Scenario: Invalid credentials
- **WHEN** user submits invalid email + password
- **THEN** response.status = 401
`;

    const spec = parseSpec(markdown);
    expect(spec.purpose).toBe('Authentication and session management.');
    expect(spec.requirements).toHaveLength(1);
    expect(spec.requirements[0].title).toBe('User Authentication');
    expect(spec.requirements[0].strength).toBe('SHALL');
    expect(spec.requirements[0].scenarios).toHaveLength(2);
  });

  it('extracts RFC 2119 strength from requirement description', () => {
    const shall = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL do X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`);
    expect(shall.requirements[0].strength).toBe('SHALL');

    const must = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system MUST do X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`);
    expect(must.requirements[0].strength).toBe('MUST');

    const should = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHOULD do X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`);
    expect(should.requirements[0].strength).toBe('SHOULD');
  });

  it('warns when requirement lacks RFC 2119 keyword', () => {
    const spec = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system does X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`);
    expect(spec.requirements[0].strength).toBe('SHALL'); // defaults to SHALL with warning
    expect(spec.warnings).toBeDefined();
    expect(spec.warnings).toContainEqual(expect.stringContaining('RFC 2119'));
  });

  it('parses scenario with WHEN/THEN and multiple AND', () => {
    const markdown = `# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nSystem SHALL work.\n\n#### Scenario: Multi\n- **WHEN** user logs in\n- **AND** user has 2FA\n- **THEN** response.status = 200\n- **AND** response.body.token is a valid JWT\n`;

    const spec = parseSpec(markdown);
    const scenario = spec.requirements[0].scenarios[0];
    expect(scenario.when).toHaveLength(2);
    expect(scenario.then).toHaveLength(2);
  });

  it('generates scenario IDs from requirement name + index', () => {
    const markdown = `# T\n## P\nx\n\n## Requirements\n\n### Requirement: User Authentication\nThe system SHALL auth.\n\n#### Scenario: Valid credentials\n- **WHEN** x\n- **THEN** y = 1\n\n#### Scenario: Invalid credentials\n- **WHEN** x\n- **THEN** y = 2\n`;

    const spec = parseSpec(markdown);
    expect(spec.requirements[0].scenarios[0].id).toBe('user-authentication-valid-credentials');
    expect(spec.requirements[0].scenarios[1].id).toBe('user-authentication-invalid-credentials');
  });

  it('supports schema_version field', () => {
    const markdown = `schema_version: 1\n\n# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`;
    const spec = parseSpec(markdown);
    expect(spec.schemaVersion).toBe(1);
  });
});

describe('Spec Validator', () => {
  it('fails on missing Purpose section', () => {
    const markdown = `# T\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`;
    const result = validateSpec(markdown);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('Purpose'));
  });

  it('fails on scenario without THEN', () => {
    const markdown = `# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x\n`;
    const result = validateSpec(markdown);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('THEN'));
  });

  it('fails on OR in scenario', () => {
    const markdown = `# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x OR y\n- **THEN** z = 1\n`;
    const result = validateSpec(markdown);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('OR'));
  });

  it('warns on unsupported schema_version', () => {
    const markdown = `schema_version: 99\n\n# T\n## P\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`;
    const result = validateSpec(markdown);
    expect(result.warnings).toContainEqual(expect.stringContaining('schema'));
  });

  it('passes on valid spec', () => {
    const markdown = `# T\n## Purpose\nx\n\n## Requirements\n\n### Requirement: A\nThe system SHALL X.\n\n#### Scenario: S\n- **WHEN** x\n- **THEN** y = 1\n`;
    const result = validateSpec(markdown);
    if (!result.valid) console.log('errors:', result.errors, 'warnings:', result.warnings);
    expect(result.valid).toBe(true);
  });
});

describe('Assertion Parser', () => {
  it('parses equality assertion', () => {
    const a = parseAssertion('response.status = 200');
    expect(a.target).toBe('response.status');
    expect(a.operator).toBe('=');
    expect(a.expected).toBe('200');
  });

  it('parses not-equal assertion', () => {
    const a = parseAssertion('response.error != null');
    expect(a.operator).toBe('!=');
    expect(a.expected).toBe('null');
  });

  it('parses contains assertion', () => {
    const a = parseAssertion('response.body.roles contains "admin"');
    expect(a.operator).toBe('contains');
    expect(a.expected).toBe('"admin"');
  });

  it('parses matches assertion', () => {
    const a = parseAssertion('response.body.token matches /^eyJ/');
    expect(a.operator).toBe('matches');
    expect(a.expected).toBe('^eyJ');
  });

  it('parses is-a assertion', () => {
    const a = parseAssertion('response.body.token is a valid JWT');
    expect(a.operator).toBe('is a');
    expect(a.expected).toBe('valid JWT');
  });

  it('parses greater-than assertion', () => {
    const a = parseAssertion('response.body.count > 0');
    expect(a.operator).toBe('>');
    expect(a.expected).toBe('0');
  });

  it('parses less-than assertion', () => {
    const a = parseAssertion('response.body.count < 100');
    expect(a.operator).toBe('<');
    expect(a.expected).toBe('100');
  });
});

describe('Delta Spec Parser', () => {
  it('parses ADDED requirements', () => {
    const markdown = `## ADDED Requirements\n\n### Requirement: User export\nSystem SHALL export data.\n\n#### Scenario: Export\n- **WHEN** user clicks export\n- **THEN** file downloads\n`;
    const delta = parseDeltaSpec(markdown);
    expect(delta.added).toHaveLength(1);
    expect(delta.added[0].title).toBe('User export');
  });

  it('parses MODIFIED requirements', () => {
    const markdown = `## MODIFIED Requirements\n\n### Requirement: User Authentication\nThe system SHALL issue a JWT with expiry.\n\n#### Scenario: Token expiry\n- **WHEN** token issued\n- **THEN** token.expires_in = 3600\n`;
    const delta = parseDeltaSpec(markdown);
    expect(delta.modified).toHaveLength(1);
    expect(delta.modified[0].title).toBe('User Authentication');
  });

  it('parses REMOVED requirements with Reason and Migration', () => {
    const markdown = `## REMOVED Requirements\n\n### Requirement: Legacy export\n**Reason**: Replaced by new system\n**Migration**: Use /api/v2/export\n`;
    const delta = parseDeltaSpec(markdown);
    expect(delta.removed).toHaveLength(1);
    expect(delta.removed[0].reason).toBe('Replaced by new system');
    expect(delta.removed[0].migration).toBe('Use /api/v2/export');
  });

  it('parses RENAMED requirements with FROM/TO', () => {
    const markdown = `## RENAMED Requirements\n\nFROM: User Auth\nTO: Authentication\n`;
    const delta = parseDeltaSpec(markdown);
    expect(delta.renamed).toHaveLength(1);
    expect(delta.renamed[0].from).toBe('User Auth');
    expect(delta.renamed[0].to).toBe('Authentication');
  });
});

describe('Spec Merge', () => {
  it('merges ADDED requirements into living spec', () => {
    const living = { requirements: [{ title: 'Existing', strength: 'SHALL', description: 'old', scenarios: [] }] };
    const delta = { added: [{ title: 'New', strength: 'SHALL', description: 'new req', scenarios: [] }], modified: [], removed: [], renamed: [] };
    const merged = mergeSpecs(living, delta);
    expect(merged.requirements).toHaveLength(2);
    expect(merged.requirements[1].title).toBe('New');
  });

  it('merges MODIFIED requirements by replacing matching name', () => {
    const living = { requirements: [{ title: 'Auth', strength: 'SHALL', description: 'old desc', scenarios: [] }] };
    const delta = { added: [], modified: [{ title: 'Auth', strength: 'SHALL', description: 'new desc', scenarios: [] }], removed: [], renamed: [] };
    const merged = mergeSpecs(living, delta);
    expect(merged.requirements).toHaveLength(1);
    expect(merged.requirements[0].description).toBe('new desc');
  });

  it('merges REMOVED requirements by removing matching name', () => {
    const living = { requirements: [{ title: 'Auth', strength: 'SHALL', description: 'x', scenarios: [] }, { title: 'Export', strength: 'SHALL', description: 'y', scenarios: [] }] };
    const delta = { added: [], modified: [], removed: [{ title: 'Auth', reason: 'old', migration: 'new' }], renamed: [] };
    const merged = mergeSpecs(living, delta);
    expect(merged.requirements).toHaveLength(1);
    expect(merged.requirements[0].title).toBe('Export');
  });

  it('merges RENAMED requirements', () => {
    const living = { requirements: [{ title: 'Old Name', strength: 'SHALL', description: 'x', scenarios: [] }] };
    const delta = { added: [], modified: [], removed: [], renamed: [{ from: 'Old Name', to: 'New Name' }] };
    const merged = mergeSpecs(living, delta);
    expect(merged.requirements[0].title).toBe('New Name');
  });
});
