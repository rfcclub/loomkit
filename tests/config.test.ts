import { describe, it, expect } from 'vitest';
import { loadConfig, type LoomKitConfig } from '../src/config/loader.js';

describe('Config System', () => {
  it('applies all defaults on empty config', () => {
    const config = loadConfig(null);
    expect(config.schema).toBe('spec-driven');
    expect(config.tdd.framework).toBe('vitest');
    expect(config.tdd.enforce).toBe(true);
    expect(config.tdd.coverageThreshold).toBe(100);
    expect(config.context).toBe('');
  });

  it('fills missing fields with defaults', () => {
    const yaml = `tdd:\n  framework: jest\n`;
    const config = loadConfig(yaml);
    expect(config.tdd.framework).toBe('jest');
    expect(config.tdd.enforce).toBe(true); // default
    expect(config.tdd.coverageThreshold).toBe(100); // default
  });

  it('validates coverage_threshold range (0-100)', () => {
    expect(() => loadConfig(`tdd:\n  coverage_threshold: 150\n`)).toThrow(/100/);
  });

  it('validates framework enum', () => {
    expect(() => loadConfig(`tdd:\n  framework: unknown-thing\n`)).toThrow(/vitest|jest|pytest|xunit|custom/);
  });;

  it('substitutes env vars', () => {
    process.env.TEST_LOOMKIT_CMD = 'my-custom-runner';
    const config = loadConfig(`tdd:\n  framework: custom\n  command: \${TEST_LOOMKIT_CMD}\n`);
    expect(config.tdd.command).toBe('my-custom-runner');
    delete process.env.TEST_LOOMKIT_CMD;
  });

  it('errors on undefined env var', () => {
    expect(() => loadConfig(`tdd:\n  command: \${NONEXISTENT_VAR_12345}\n`)).toThrow(/not set/);
  });

  it('uses defaults when config not found', () => {
    const config = loadConfig(null);
    expect(config.schema).toBe('spec-driven');
  });
});
