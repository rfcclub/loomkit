import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { PlanGuard } from '../../src/harness/plan-guard.ts'
import { sha256File } from '../../src/harness/phase-json.ts'
import { createDebugLoopJson, writeDebugLoopJson, readDebugLoopJson } from '@gotako/hammerhead-debug'
import type { PlanJson, PlanTask } from '../../src/harness/types.ts'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-planguard-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

const makePlan = (tasks: PlanTask[] = []): PlanJson => ({
  schema_version: '1.0',
  change_id: 'checkout-promo',
  traces_to: { target: 'INTENT-001', status: 'RESOLVED' },
  tasks,
  escalation: { max_improvement_iterations: 6 },
})

const makeTask = (overrides: Partial<PlanTask> = {}): PlanTask => ({
  id: 'TASK-1',
  status: 'pending',
  behavior: 'does a thing',
  acceptance: 'test_thing passes',
  files: ['a.py'],
  test: 'tests/test_thing.py',
  consumes: [],
  produces: [],
  ...overrides,
})

describe('PlanGuard.canStartTask', () => {
  it('blocks when plan is not traced', () => {
    const guard = new PlanGuard(tmpDir)
    const plan = makePlan()
    plan.traces_to.status = 'PENDING'
    expect(() => guard.canStartTask(makeTask(), plan)).toThrow(/not traced/)
  })

  it('blocks when acceptance is empty', () => {
    const guard = new PlanGuard(tmpDir)
    expect(() => guard.canStartTask(makeTask({ acceptance: '' }), makePlan())).toThrow(/no acceptance/)
  })

  it('blocks when task touches more than 2 files', () => {
    const guard = new PlanGuard(tmpDir)
    expect(() => guard.canStartTask(makeTask({ files: ['a.py', 'b.py', 'c.py'] }), makePlan())).toThrow(/>2 files/)
  })

  it('blocks when test is empty', () => {
    const guard = new PlanGuard(tmpDir)
    expect(() => guard.canStartTask(makeTask({ test: '' }), makePlan())).toThrow(/no test/)
  })

  it('blocks when a consumed artifact has no producer task', () => {
    const guard = new PlanGuard(tmpDir)
    const task = makeTask({ consumes: [{ path: 'promo.py', sha256: 'p1' }] })
    expect(() => guard.canStartTask(task, makePlan())).toThrow(/no upstream task produces/)
  })

  it('blocks when producer task is not complete', () => {
    const guard = new PlanGuard(tmpDir)
    const producer = makeTask({ id: 'TASK-1', status: 'in_progress', produces: [{ path: 'promo.py', sha256: 'p1' }] })
    const consumer = makeTask({ id: 'TASK-2', consumes: [{ path: 'promo.py', sha256: 'p1' }] })
    expect(() => guard.canStartTask(consumer, makePlan([producer, consumer]))).toThrow(/TASK-1 not done/)
  })

  it('blocks when consumed hash does not match producer record (stale)', () => {
    const guard = new PlanGuard(tmpDir)
    const producer = makeTask({ id: 'TASK-1', status: 'complete', produces: [{ path: 'promo.py', sha256: 'p1' }] })
    const consumer = makeTask({ id: 'TASK-2', consumes: [{ path: 'promo.py', sha256: 'DIFFERENT' }] })
    expect(() => guard.canStartTask(consumer, makePlan([producer, consumer]))).toThrow(/stale/)
  })

  it('blocks when file on disk changed since producer recorded it', () => {
    const filePath = join(tmpDir, 'promo.py')
    writeFileSync(filePath, 'original')
    const originalHash = sha256File(filePath)
    writeFileSync(filePath, 'mutated after produce')

    const guard = new PlanGuard(tmpDir, tmpDir)
    const producer = makeTask({ id: 'TASK-1', status: 'complete', produces: [{ path: 'promo.py', sha256: originalHash }] })
    const consumer = makeTask({ id: 'TASK-2', consumes: [{ path: 'promo.py', sha256: originalHash }] })
    expect(() => guard.canStartTask(consumer, makePlan([producer, consumer]))).toThrow(/stale/)
  })

  it('allows a task with a valid, matching chain', () => {
    const filePath = join(tmpDir, 'promo.py')
    writeFileSync(filePath, 'content')
    const hash = sha256File(filePath)

    const guard = new PlanGuard(tmpDir, tmpDir)
    const producer = makeTask({ id: 'TASK-1', status: 'complete', produces: [{ path: 'promo.py', sha256: hash }] })
    const consumer = makeTask({ id: 'TASK-2', consumes: [{ path: 'promo.py', sha256: hash }] })
    expect(() => guard.canStartTask(consumer, makePlan([producer, consumer]))).not.toThrow()
  })

  it('resolves consumed files against the project root, not the change directory', () => {
    const changeDir = join(tmpDir, 'openspec', 'changes', 'checkout-promo')
    mkdirSync(changeDir, { recursive: true })
    const filePath = join(tmpDir, 'promo.py')
    writeFileSync(filePath, 'content')
    const hash = sha256File(filePath)

    // changeDir has no promo.py at all — only the project root does.
    const guard = new PlanGuard(changeDir, tmpDir)
    const producer = makeTask({ id: 'TASK-1', status: 'complete', produces: [{ path: 'promo.py', sha256: hash }] })
    const consumer = makeTask({ id: 'TASK-2', consumes: [{ path: 'promo.py', sha256: hash }] })
    expect(() => guard.canStartTask(consumer, makePlan([producer, consumer]))).not.toThrow()
  })
})

describe('PlanGuard.canCompleteTask', () => {
  it('blocks when gate has not passed', () => {
    const guard = new PlanGuard(tmpDir)
    expect(() => guard.canCompleteTask(makeTask(), false)).toThrow(/gate/)
  })

  it('allows a task with no debug_ref once gate passes', () => {
    const guard = new PlanGuard(tmpDir)
    expect(() => guard.canCompleteTask(makeTask(), true)).not.toThrow()
  })

  it('blocks when debug_ref points to a missing session', () => {
    const guard = new PlanGuard(tmpDir)
    const task = makeTask({
      debug_ref: { session: 'debug/missing', resolved_by_cycle: 'H2', root_cause: 'x', cost: { refuted_cycles: 0, escalated: false } },
    })
    expect(() => guard.canCompleteTask(task, true)).toThrow(/does not exist/)
  })

  it('blocks when the referenced cycle is not confirmed', () => {
    const session = createDebugLoopJson(tmpDir, 'debug/PCC-4821', {
      boundRepoSha: 'sha',
      servesTask: { plan: 'checkout-promo', task: 'TASK-3' },
      symptom: { description: 'x', repro_cmd: 'true' },
    })
    session.cycles.push({ id: 'H2', status: 'refuted', hypothesis: 'h', prediction: 'p', verdict: { prediction_held: false, result: 'REFUTED' } })
    writeDebugLoopJson(tmpDir, session)

    const guard = new PlanGuard(tmpDir)
    const task = makeTask({
      debug_ref: { session: 'debug/PCC-4821', resolved_by_cycle: 'H2', root_cause: 'x', cost: { refuted_cycles: 1, escalated: false } },
    })
    expect(() => guard.canCompleteTask(task, true)).toThrow(/not a confirmed cycle/)
  })

  it('blocks when debug_ref cycle does not match the cycle that authorized the fix', () => {
    const session = createDebugLoopJson(tmpDir, 'debug/PCC-4821', {
      boundRepoSha: 'sha',
      servesTask: { plan: 'checkout-promo', task: 'TASK-3' },
      symptom: { description: 'x', repro_cmd: 'true' },
    })
    session.cycles.push({ id: 'H2', status: 'confirmed', hypothesis: 'h', prediction: 'p', verdict: { prediction_held: true, result: 'CONFIRMED' } })
    session.fix.authorized_by_cycle = 'H1'
    writeDebugLoopJson(tmpDir, session)

    const guard = new PlanGuard(tmpDir)
    const task = makeTask({
      debug_ref: { session: 'debug/PCC-4821', resolved_by_cycle: 'H2', root_cause: 'x', cost: { refuted_cycles: 1, escalated: false } },
    })
    expect(() => guard.canCompleteTask(task, true)).toThrow(/does not match/)
  })

  it('allows completion when debug_ref resolves to a confirmed, authorized cycle', () => {
    const session = createDebugLoopJson(tmpDir, 'debug/PCC-4821', {
      boundRepoSha: 'sha',
      servesTask: { plan: 'checkout-promo', task: 'TASK-3' },
      symptom: { description: 'x', repro_cmd: 'true' },
    })
    session.cycles.push({ id: 'H2', status: 'confirmed', hypothesis: 'h', prediction: 'p', verdict: { prediction_held: true, result: 'CONFIRMED' } })
    session.fix.authorized_by_cycle = 'H2'
    writeDebugLoopJson(tmpDir, session)
    expect(readDebugLoopJson(tmpDir, 'debug/PCC-4821').fix.authorized_by_cycle).toBe('H2')

    const guard = new PlanGuard(tmpDir)
    const task = makeTask({
      debug_ref: { session: 'debug/PCC-4821', resolved_by_cycle: 'H2', root_cause: 'x', cost: { refuted_cycles: 1, escalated: false } },
    })
    expect(() => guard.canCompleteTask(task, true)).not.toThrow()
  })
})
