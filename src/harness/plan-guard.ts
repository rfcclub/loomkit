import { existsSync } from 'fs'
import { resolve } from 'path'
import { sha256File } from './phase-json.js'
import { readDebugLoopJson } from '@gotako/hammerhead-debug'
import type { DebugLoopJson } from '@gotako/hammerhead-debug'
import { findProducerTask } from './plan-json.js'
import type { PlanJson, PlanTask } from './types.js'

export class PlanGuard {
  constructor(private changeDir: string, private projectRoot: string = process.cwd()) {}

  canStartTask(task: PlanTask, plan: PlanJson): void {
    if (plan.traces_to.status !== 'RESOLVED') {
      throw new Error('plan not traced')
    }
    if (!task.acceptance) {
      throw new Error(`${task.id}: no acceptance = no ground truth = not a task`)
    }
    if (task.files.length > 2) {
      throw new Error(`${task.id}: task touches >2 files — split it`)
    }
    if (!task.test) {
      throw new Error(`${task.id}: no test — can't verify, can't size`)
    }

    for (const art of task.consumes) {
      const producer = findProducerTask(plan, art.path)
      if (!producer) {
        throw new Error(`${task.id}: no upstream task produces ${art.path}`)
      }
      if (producer.status !== 'complete') {
        throw new Error(`${task.id}: upstream task ${producer.id} not done`)
      }
      const producedArt = producer.produces.find(a => a.path === art.path)
      if (!producedArt || producedArt.sha256 !== art.sha256) {
        throw new Error(`${task.id}: stale — ${art.path} changed since ${producer.id} produced it`)
      }
      const filePath = resolve(this.projectRoot, art.path)
      if (existsSync(filePath) && art.sha256 && sha256File(filePath) !== art.sha256) {
        throw new Error(`${task.id}: stale — ${art.path} changed on disk since ${producer.id} produced it`)
      }
    }
  }

  canCompleteTask(task: PlanTask, gatePassed: boolean): void {
    if (!gatePassed) {
      throw new Error(`${task.id}: gate chưa xanh`)
    }

    if (task.debug_ref) {
      const session = this.tryReadDebugLoop(task.debug_ref.session)
      if (!session) {
        throw new Error(`${task.id}: debug_ref points to a session that does not exist: ${task.debug_ref.session}`)
      }
      const cyc = session.cycles.find(c => c.id === task.debug_ref!.resolved_by_cycle)
      if (!cyc || cyc.status !== 'confirmed' || cyc.verdict?.prediction_held !== true) {
        throw new Error(`${task.id}: debug_ref.resolved_by_cycle is not a confirmed cycle with a held prediction`)
      }
      if (session.fix.authorized_by_cycle !== task.debug_ref.resolved_by_cycle) {
        throw new Error(`${task.id}: debug_ref cycle does not match the cycle that authorized the fix`)
      }
    }
  }

  private tryReadDebugLoop(sessionId: string): DebugLoopJson | undefined {
    try {
      return readDebugLoopJson(this.changeDir, sessionId)
    } catch {
      return undefined
    }
  }
}
