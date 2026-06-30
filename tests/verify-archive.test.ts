import { describe, it, expect } from 'vitest';
import { verify, type VerifyInput, type VerifyResult } from '../src/verify/verify.js';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { cmdVerify, findChangeSpecFiles } from '../src/cli/commands/verify.js';

describe('Verify', () => {
  it('passes with 100% coverage', () => {
    const input: VerifyInput = {
      mandatoryScenarios: ['auth-valid', 'auth-invalid'],
      passingTests: ['auth-valid', 'auth-invalid'],
      threshold: 100,
    };
    const result = verify(input);
    expect(result.passed).toBe(true);
    expect(result.coverage).toBe(1);
  });

  it('fails with partial coverage and lists uncovered', () => {
    const input: VerifyInput = {
      mandatoryScenarios: ['a', 'b', 'c', 'd', 'e'],
      passingTests: ['a', 'b', 'c', 'd'],
      threshold: 100,
    };
    const result = verify(input);
    expect(result.passed).toBe(false);
    expect(result.coverage).toBe(0.8);
    expect(result.uncovered).toEqual(['e']);
  });

  it('formats per-scenario status table', () => {
    const input: VerifyInput = {
      mandatoryScenarios: ['a', 'b'],
      passingTests: ['a'],
      threshold: 100,
      scenarioTests: { a: 'tests/a.test.ts', b: 'tests/b.test.ts' },
    };
    const result = verify(input);
    const table = result.scenarioStatus;
    expect(table).toEqual([
      { scenario: 'a', test: 'tests/a.test.ts', status: '✓' },
      { scenario: 'b', test: 'tests/b.test.ts', status: '✗' },
    ]);
  });

  it('discovers OpenSpec multi-capability spec files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'loomkit-verify-'));
    try {
      mkdirSync(join(dir, 'specs', 'mesh-bus'), { recursive: true });
      mkdirSync(join(dir, 'specs', 'mesh-notify'), { recursive: true });
      writeFileSync(join(dir, 'specs', 'mesh-bus', 'spec.md'), '# Bus\n');
      writeFileSync(join(dir, 'specs', 'mesh-notify', 'spec.md'), '# Notify\n');

      expect(findChangeSpecFiles(dir, 'colony-mesh')).toEqual([
        join(dir, 'specs', 'mesh-bus', 'spec.md'),
        join(dir, 'specs', 'mesh-notify', 'spec.md'),
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('verifies OpenSpec multi-capability changes instead of skipping them', () => {
    const root = mkdtempSync(join(tmpdir(), 'loomkit-project-'));
    const originalCwd = process.cwd();

    try {
      const changeDir = join(root, 'openspec', 'changes', 'colony-mesh');
      mkdirSync(join(changeDir, 'specs', 'mesh-bus'), { recursive: true });
      mkdirSync(join(changeDir, 'specs', 'mesh-notify'), { recursive: true });
      writeFileSync(join(changeDir, 'specs', 'mesh-bus', 'spec.md'), `# Mesh Bus Specification

## Purpose
Test bus verification.

## Requirements

### Requirement: Durable Delivery
The system SHALL store delivery state per recipient.

#### Scenario: Claim one delivery
- **WHEN** a consumer pulls mail
- **THEN** one delivery is claimed
`);
      writeFileSync(join(changeDir, 'specs', 'mesh-notify', 'spec.md'), `# Mesh Notify Specification

## Purpose
Test notify verification.

## Requirements

### Requirement: Doorbell Only
The system MUST treat sockets as wake signals.

#### Scenario: Wake without delivery
- **WHEN** a socket wakeup arrives
- **THEN** the database is queried
`);
      writeFileSync(join(changeDir, '.traceability.yaml'), `scenarios:
  - scenario: durable-delivery-claim-one-delivery
    status: passing
  - scenario: doorbell-only-wake-without-delivery
    status: passing
`);

      process.chdir(root);
      cmdVerify('colony-mesh');

      const result = JSON.parse(readFileSync(join(changeDir, '.loomkit-verify.json'), 'utf-8'));
      expect(result.total_scenarios).toBe(2);
      expect(result.passing).toBe(2);
      expect(result.coverage).toBe(1);
      expect(result.passed).toBe(true);
    } finally {
      process.chdir(originalCwd);
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('Archive Gate', () => {
  it('blocks archive without verify', async () => {
    const { canArchive } = await import('../src/archive/archive.js');
    expect(canArchive(null)).toBe(false);
  });

  it('blocks archive after verify failure', async () => {
    const { canArchive } = await import('../src/archive/archive.js');
    const verifyResult: VerifyResult = {
      passed: false,
      coverage: 0.8,
      threshold: 100,
      uncovered: ['e'],
      scenarioStatus: [],
      timestamp: new Date().toISOString(),
    };
    expect(canArchive(verifyResult)).toBe(false);
  });

  it('allows archive after verify pass', async () => {
    const { canArchive } = await import('../src/archive/archive.js');
    const verifyResult: VerifyResult = {
      passed: true,
      coverage: 1,
      threshold: 100,
      uncovered: [],
      scenarioStatus: [],
      timestamp: new Date().toISOString(),
    };
    expect(canArchive(verifyResult)).toBe(true);
  });

  it('allows force archive with reason', async () => {
    const { canArchive } = await import('../src/archive/archive.js');
    expect(canArchive(null, { force: true, reason: 'hotfix' })).toBe(true);
  });

  it('blocks force archive without reason', async () => {
    const { canArchive } = await import('../src/archive/archive.js');
    expect(canArchive(null, { force: true, reason: '' })).toBe(false);
  });

  it('merges OpenSpec multi-capability changes into matching living specs', async () => {
    const { mergeSpecIntoLiving } = await import('../src/cli/commands/archive.js');
    const root = mkdtempSync(join(tmpdir(), 'loomkit-archive-'));

    try {
      const changeDir = join(root, 'changes', 'colony-mesh');
      const specsDir = join(root, 'specs');
      mkdirSync(join(changeDir, 'specs', 'mesh-bus'), { recursive: true });
      mkdirSync(join(changeDir, 'specs', 'mesh-notify'), { recursive: true });

      writeFileSync(join(changeDir, 'specs', 'mesh-bus', 'spec.md'), `## ADDED Requirements

### Requirement: Durable Delivery
The system SHALL store delivery state per recipient.

#### Scenario: Claim one delivery
- **WHEN** a consumer pulls mail
- **THEN** one delivery is claimed
`);
      writeFileSync(join(changeDir, 'specs', 'mesh-notify', 'spec.md'), `## ADDED Requirements

### Requirement: Doorbell Only
The system MUST treat sockets as wake signals.

#### Scenario: Wake without delivery
- **WHEN** a socket wakeup arrives
- **THEN** the database is queried
`);

      mergeSpecIntoLiving('colony-mesh', changeDir, specsDir);

      expect(readFileSync(join(specsDir, 'mesh-bus', 'spec.md'), 'utf-8')).toContain('Durable Delivery');
      expect(readFileSync(join(specsDir, 'mesh-notify', 'spec.md'), 'utf-8')).toContain('Doorbell Only');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
