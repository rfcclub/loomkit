import { describe, it, expect, beforeEach } from 'vitest';
import { TraceabilityMap, calculateCoverage } from '../src/tdd/traceability.js';

describe('Traceability', () => {
  let tm: TraceabilityMap;

  beforeEach(() => {
    tm = new TraceabilityMap();
  });

  it('adds scenario→test mapping', () => {
    tm.addMapping('auth-valid-credentials', 'tests/auth.test.ts::test_valid_credentials');
    const mapping = tm.getMapping('auth-valid-credentials');
    expect(mapping?.test).toBe('tests/auth.test.ts::test_valid_credentials');
    expect(mapping?.status).toBe('pending');
  });

  it('updates scenario status (pending→passing→failing)', () => {
    tm.addMapping('auth-valid', 'tests/auth.test.ts::test_valid');
    tm.updateStatus('auth-valid', 'passing');
    expect(tm.getMapping('auth-valid')?.status).toBe('passing');
    tm.updateStatus('auth-valid', 'failing');
    expect(tm.getMapping('auth-valid')?.status).toBe('failing');
  });

  it('finds uncovered scenarios', () => {
    tm.addMapping('auth-valid', 'tests/auth.test.ts::test_valid');
    const uncovered = tm.findUncovered(['auth-valid', 'auth-invalid', 'auth-expired']);
    expect(uncovered).toEqual(['auth-invalid', 'auth-expired']);
  });

  it('serializes to YAML-compatible object', () => {
    tm.addMapping('auth-valid', 'tests/auth.test.ts::test_valid');
    tm.updateStatus('auth-valid', 'passing');
    const obj = tm.toObject();
    expect(obj.mappings).toHaveLength(1);
    expect(obj.mappings[0].scenario).toBe('auth-valid');
    expect(obj.mappings[0].status).toBe('passing');
  });
});

describe('Coverage Calculator', () => {
  it('fails when coverage below threshold', () => {
    const mandatoryScenarios = ['a', 'b', 'c', 'd', 'e'];
    const passing = ['a', 'b', 'c', 'd']; // 4/5 = 80%
    const result = calculateCoverage(mandatoryScenarios, passing, 100);
    expect(result.coverage).toBe(0.8);
    expect(result.passes).toBe(false);
  });

  it('passes at threshold', () => {
    const mandatoryScenarios = ['a', 'b', 'c'];
    const passing = ['a', 'b', 'c'];
    const result = calculateCoverage(mandatoryScenarios, passing, 100);
    expect(result.coverage).toBe(1);
    expect(result.passes).toBe(true);
  });

  it('excludes SHOULD scenarios from threshold', () => {
    // SHOULD scenarios not in mandatoryScenarios = excluded
    const mandatoryScenarios = ['a', 'b']; // only SHALL/MUST
    const passing = ['a', 'b'];
    const result = calculateCoverage(mandatoryScenarios, passing, 100);
    expect(result.passes).toBe(true);
  });

  it('handles zero mandatory scenarios', () => {
    const result = calculateCoverage([], [], 100);
    expect(result.coverage).toBe(1); // 100% by vacuous truth
    expect(result.passes).toBe(true);
  });
});
