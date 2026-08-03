import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  createPlanJson,
  readPlanJson,
  writePlanJson,
  findProducerTask,
} from '../../src/harness/plan-json.ts'
import type { PlanTask } from '../../src/harness/types.ts'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-plan-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

const makeTask = (overrides: Partial<PlanTask> = {}): PlanTask => ({
  id: 'TASK-1',
  status: 'pending',
  behavior: 'does a thing',
  acceptance: 'test_thing passes',
  files: ['a.py'],
  test: 'tests/test_thing.py',
  consumes: [],
  produces: [{ path: 'a.py', sha256: 'abc' }],
  ...overrides,
})

describe('plan-json', () => {
  it('createPlanJson creates a valid plan.json', () => {
    createPlanJson(tmpDir, 'checkout-promo', 'INTENT-001')
    const plan = readPlanJson(tmpDir)
    expect(plan.change_id).toBe('checkout-promo')
    expect(plan.traces_to.target).toBe('INTENT-001')
    expect(plan.traces_to.status).toBe('PENDING')
    expect(plan.tasks).toEqual([])
  })

  it('writePlanJson round-trips tasks', () => {
    createPlanJson(tmpDir, 'x', 'INTENT-001')
    const plan = readPlanJson(tmpDir)
    plan.tasks.push(makeTask())
    writePlanJson(tmpDir, plan)
    const plan2 = readPlanJson(tmpDir)
    expect(plan2.tasks).toHaveLength(1)
    expect(plan2.tasks[0].id).toBe('TASK-1')
  })

  it('readPlanJson throws when plan.json missing', () => {
    expect(() => readPlanJson(tmpDir)).toThrow(/plan\.json not found/)
  })

  it('findProducerTask finds the task that produces a given path', () => {
    createPlanJson(tmpDir, 'x', 'INTENT-001')
    const plan = readPlanJson(tmpDir)
    plan.tasks.push(makeTask({ id: 'TASK-1', produces: [{ path: 'promo.py', sha256: 'p1' }] }))
    const found = findProducerTask(plan, 'promo.py')
    expect(found?.id).toBe('TASK-1')
  })

  it('findProducerTask returns undefined for unknown path', () => {
    createPlanJson(tmpDir, 'x', 'INTENT-001')
    const plan = readPlanJson(tmpDir)
    expect(findProducerTask(plan, 'unknown.py')).toBeUndefined()
  })
})
