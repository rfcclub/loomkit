import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { probePlanTasks, type ValidateWithProbeFn, type CheckTestPinsBehaviorFn } from '../../src/harness/gate-code.ts'
import { writePlanJson } from '../../src/harness/plan-json.ts'
import type { PlanJson, PlanTask } from '../../src/harness/types.ts'

let tmpDir: string
let changeDir: string

function baseTask(overrides: Partial<PlanTask>): PlanTask {
  return {
    id: 'T1',
    status: 'complete',
    behavior: 'does the thing',
    acceptance: 'the thing works',
    files: ['src/thing.ts'],
    test: 'thing.test.ts',
    consumes: [],
    produces: [],
    ...overrides,
  }
}

function writePlan(tasks: PlanTask[]): void {
  const plan: PlanJson = {
    schema_version: '1.0',
    change_id: 'test-change',
    traces_to: { target: 'intent.md', status: 'RESOLVED' },
    tasks,
    escalation: { max_improvement_iterations: 6 },
  }
  writePlanJson(changeDir, plan)
}

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-gate-code-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  changeDir = join(tmpDir, 'openspec', 'changes', 'test-change')
  mkdirSync(changeDir, { recursive: true })
  // probePlanTasks resolves task.test relative to changeDir/.. — write the dummy test file there.
  writeFileSync(join(changeDir, '..', 'thing.test.ts'), 'test file placeholder')
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

const baseResult = { advisory_notes: [] as string[], trust_score: 100 }
const specInfo = { content: '# spec', testLog: '', diffOutput: '' }

describe('probePlanTasks', () => {
  it('no plan.json → not probed, result untouched', async () => {
    rmSync(join(changeDir, 'plan.json'), { force: true })
    const { result, probed } = await probePlanTasks(baseResult, changeDir, specInfo)
    expect(probed).toBe(false)
    expect(result).toBe(baseResult)
  })

  it('no tasks with a test → not probed', async () => {
    writePlan([baseTask({ test: '' })])
    const { probed } = await probePlanTasks(baseResult, changeDir, specInfo)
    expect(probed).toBe(false)
  })

  it('matched criterion routes through validateWithProbe, uses its trust_deduction', async () => {
    writePlan([baseTask({})])
    const validateWithProbe: ValidateWithProbeFn = async () => ({
      issues: [
        { type: 'SPEC_UNTESTED', evidence: 'T1 — mutation survived', trust_deduction: 5 },
      ],
      coverage: [{ criterion: 'the thing works', pinned: false }],
    })
    const checkTestPinsBehavior: CheckTestPinsBehaviorFn = async () => {
      throw new Error('fallback should not be called when validateWithProbe matched the criterion')
    }
    const { result, probed } = await probePlanTasks(baseResult, changeDir, specInfo, {
      validateWithProbe,
      checkTestPinsBehavior,
    })
    expect(probed).toBe(true)
    expect(result.trust_score).toBe(95)
    expect(result.advisory_notes?.[0]).toContain('T1 — mutation survived')
  })

  it('unmatched criterion falls back to checkTestPinsBehavior directly, never silently drops', async () => {
    writePlan([baseTask({})])
    // validateWithProbe returns no coverage entry pinned for this criterion — simulates
    // task.acceptance text not substring-matching anything in spec.md.
    const validateWithProbe: ValidateWithProbeFn = async () => ({
      issues: [],
      coverage: [],
    })
    const checkTestPinsBehavior: CheckTestPinsBehaviorFn = async () => ({
      pinned: false,
      survivors: ['mutated source'],
    })
    const { result, probed } = await probePlanTasks(baseResult, changeDir, specInfo, {
      validateWithProbe,
      checkTestPinsBehavior,
    })
    expect(probed).toBe(true)
    expect(result.trust_score).toBe(97) // flat -3 fallback deduction
    expect(result.advisory_notes?.[0]).toContain('fallback')
    expect(result.advisory_notes?.[0]).toContain('T1')
  })

  it('validateWithProbe throwing falls back for every task, does not propagate the error', async () => {
    writePlan([baseTask({})])
    const validateWithProbe: ValidateWithProbeFn = async () => {
      throw new Error('seal-gate internal error')
    }
    const checkTestPinsBehavior: CheckTestPinsBehaviorFn = async () => ({ pinned: true, survivors: [] })
    const { probed } = await probePlanTasks(baseResult, changeDir, specInfo, {
      validateWithProbe,
      checkTestPinsBehavior,
    })
    expect(probed).toBe(true) // ran (via fallback), just found nothing wrong
  })

  it('pinned test (matched, no survivors) produces no advisory and no deduction', async () => {
    writePlan([baseTask({})])
    const validateWithProbe: ValidateWithProbeFn = async () => ({
      issues: [],
      coverage: [{ criterion: 'the thing works', pinned: true }],
    })
    const { result, probed } = await probePlanTasks(baseResult, changeDir, specInfo, {
      validateWithProbe,
      checkTestPinsBehavior: async () => ({ pinned: true, survivors: [] }),
    })
    expect(probed).toBe(true)
    expect(result).toBe(baseResult) // unchanged — no advisory, no deduction
  })

  it('missing test file on disk reports it without calling either probe path', async () => {
    writePlan([baseTask({ test: 'does-not-exist.test.ts' })])
    let called = false
    const { result, probed } = await probePlanTasks(baseResult, changeDir, specInfo, {
      validateWithProbe: async () => {
        called = true
        return { issues: [], coverage: [] }
      },
    })
    expect(probed).toBe(true)
    expect(called).toBe(false)
    expect(result.advisory_notes?.[0]).toContain('test file not found')
  })

  it('seal-gate unavailable (no deps injected, no real seal-gate to import in test env) degrades to not probed', async () => {
    writePlan([baseTask({})])
    // No deps injected — falls through to the real dynamic import('seal-gate'), which may or
    // may not exist in the test environment. Either way this must never throw.
    await expect(probePlanTasks(baseResult, changeDir, specInfo)).resolves.toBeDefined()
  })
})
