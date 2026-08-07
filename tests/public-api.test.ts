import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { readPlanJson, findProducerTask, type PlanJson } from '../src/index.js';

// Pilotfish (a sibling package, @gotako/pilotfish) depends on this exact export —
// its own intent.md requires reading plan.json "through loomkit rather than
// re-parsing it independently." Regression coverage for the gap found and fixed
// 2026-08-06/07: src/index.ts exported the older spec-driven API only, nothing
// from src/harness/, so that constraint was unsatisfiable until this export existed.

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-public-api-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('public API — harness plan.json access', () => {
  it('readPlanJson is importable from the package root and reads a real plan.json', () => {
    const plan: PlanJson = {
      schema_version: '1.0',
      change_id: 'x',
      traces_to: { target: 'intent.md', status: 'RESOLVED' },
      tasks: [
        {
          id: 'T1', status: 'pending', behavior: 'b', acceptance: 'a',
          files: ['f.ts'], test: 't.test.ts', consumes: [], produces: [{ path: 'f.ts', sha256: 'abc' }],
        },
      ],
      escalation: { max_improvement_iterations: 4 },
    };
    writeFileSync(join(tmpDir, 'plan.json'), JSON.stringify(plan));

    const loaded = readPlanJson(tmpDir);
    expect(loaded.change_id).toBe('x');
    expect(loaded.tasks[0].id).toBe('T1');
  });

  it('findProducerTask is importable from the package root', () => {
    const plan: PlanJson = {
      schema_version: '1.0',
      change_id: 'x',
      traces_to: { target: 'intent.md', status: 'RESOLVED' },
      tasks: [
        { id: 'T1', status: 'complete', behavior: 'b', acceptance: 'a', files: [], test: 't', consumes: [], produces: [{ path: 'out.ts', sha256: 'h' }] },
      ],
      escalation: { max_improvement_iterations: 4 },
    };
    expect(findProducerTask(plan, 'out.ts')?.id).toBe('T1');
    expect(findProducerTask(plan, 'nope.ts')).toBeUndefined();
  });
});
