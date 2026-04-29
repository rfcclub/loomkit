import { describe, it, expect } from 'vitest';
import { verify, type VerifyInput, type VerifyResult } from '../src/verify/verify.js';

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
});
