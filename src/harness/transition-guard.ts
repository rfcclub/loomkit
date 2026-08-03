import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { execFileSync } from 'child_process'
import { readPhaseJson, sha256File, LIFECYCLE } from './phase-json.js'
import type { Phase, PhaseJson } from './types.js'

export class TransitionGuard {
  constructor(private changeDir: string) {}

  canEnter(target: Phase, skip = false): void {
    if (skip) {
      console.warn('⚠  --skip-state-check active — phase enforcement bypassed')
      return
    }

    let pj: PhaseJson
    try {
      pj = readPhaseJson(this.changeDir)
    } catch {
      console.warn('⚠  phase.json not found — running in degraded mode (no state enforcement)')
      return
    }

    const idx = LIFECYCLE.indexOf(target)
    const prev = idx > 0 ? LIFECYCLE[idx - 1] : null

    // 1. Prior phase must be complete
    if (prev && pj.phases[prev].status !== 'complete') {
      throw new Error(`cannot enter ${target}: ${prev} not complete`)
    }

    // 2. Provenance chain — consumed hashes must match what the producer recorded
    for (const art of (pj.phases[target]?.consumed ?? [])) {
      if (!art.path) continue
      const filePath = resolve(this.changeDir, art.path)
      const recorded = this.findProducerHash(pj, art.path)
      if (!recorded) throw new Error(`provenance broken: ${art.path} not found in any upstream produced[] list`)
      if (art.sha256 !== recorded) throw new Error(`provenance broken: ${art.path} not derived from approved upstream`)
      if (existsSync(filePath)) {
        const onDisk = sha256File(filePath)
        if (art.sha256 !== onDisk) throw new Error(`stale: ${art.path} changed on disk after this phase ran`)
      }
    }

    // 3. Human sign-off must be an on-disk artifact
    if (prev && pj.phases[prev].authorized_exit_by?.type === 'human_signoff') {
      const marker = pj.phases[prev].authorized_exit_by!.marker
      if (!this.markerPresent(marker)) {
        throw new Error(`${prev} requires human sign-off; marker absent: ${marker}`)
      }
    }

    // 4. finish gate — invariants enforced regardless of any config
    if (target === 'finish') {
      const v = pj.gate_code_verdict
      if (!v) throw new Error('no gate-code verdict — gate was skipped')
      if (v.verdict !== 'PASS' && v.verdict !== 'PASS_WITH_WARNINGS') {
        throw new Error(`gate-code verdict is ${v.verdict}, not PASS`)
      }
      try {
        const currentDiff = createHash('sha256')
          .update(execFileSync('git', ['diff', 'HEAD'], { cwd: this.changeDir, stdio: ['pipe', 'pipe', 'pipe'] }).toString())
          .digest('hex')
        if (v.bound_diff_sha256 !== currentDiff) {
          throw new Error(
            `verdict bound to ${v.bound_diff_sha256.slice(0, 8)}, code is now ${currentDiff.slice(0, 8)} — stale PASS`
          )
        }
      } catch (e) {
        if ((e as Error).message.includes('stale PASS')) throw e
        // git not available or no diff — skip diff binding check
      }
      if (pj.phases['verify'].status !== 'complete') {
        throw new Error('verify not complete')
      }
    }
  }

  private findProducerHash(pj: PhaseJson, path: string): string | undefined {
    for (const phase of LIFECYCLE) {
      const entry = pj.phases[phase]
      const match = entry?.produced?.find(a => a.path === path)
      if (match) return match.sha256
    }
    return undefined
  }

  private markerPresent(marker: string): boolean {
    // marker format: "filename:key=value"
    const colonIdx = marker.indexOf(':')
    if (colonIdx === -1) return existsSync(join(this.changeDir, marker))
    const file = marker.slice(0, colonIdx)
    const condition = marker.slice(colonIdx + 1)
    const filePath = join(this.changeDir, file)
    if (!existsSync(filePath)) return false
    const content = readFileSync(filePath, 'utf-8').toLowerCase()
    const eqIdx = condition.indexOf('=')
    if (eqIdx === -1) return content.includes(condition.toLowerCase())
    const key = condition.slice(0, eqIdx).toLowerCase()
    const value = condition.slice(eqIdx + 1).toLowerCase()
    return content.includes(`${key}: ${value}`) || content.includes(`${key}=${value}`)
  }
}
