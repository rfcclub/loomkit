import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { PlanJson, PlanTask } from './types.js'

export function createPlanJson(changeDir: string, changeId: string, traceTarget: string): PlanJson {
  const plan: PlanJson = {
    schema_version: '1.0',
    change_id: changeId,
    traces_to: { target: traceTarget, status: 'PENDING' },
    tasks: [],
    escalation: { max_improvement_iterations: 6 },
  }
  writePlanJson(changeDir, plan)
  return plan
}

export function readPlanJson(changeDir: string): PlanJson {
  const p = planJsonPath(changeDir)
  if (!existsSync(p)) throw new Error(`plan.json not found at ${p} — run loomkit plan first`)
  return JSON.parse(readFileSync(p, 'utf-8')) as PlanJson
}

export function writePlanJson(changeDir: string, plan: PlanJson): void {
  mkdirSync(changeDir, { recursive: true })
  writeFileSync(planJsonPath(changeDir), JSON.stringify(plan, null, 2) + '\n')
}

export function findProducerTask(plan: PlanJson, path: string): PlanTask | undefined {
  return plan.tasks.find(t => t.produces.some(a => a.path === path))
}

function planJsonPath(changeDir: string): string {
  return join(changeDir, 'plan.json')
}
