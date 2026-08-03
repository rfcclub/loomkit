import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { Phase, PhaseEntry, PhaseJson, ArtifactRef, AuthorizedExit, VerdictEntry } from './types.js'
import { LIFECYCLE } from './types.js'

export { LIFECYCLE }
export type { Phase, PhaseEntry, PhaseJson, ArtifactRef, AuthorizedExit, VerdictEntry }

export function sha256File(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

export function sha256String(s: string): string {
  return createHash('sha256').update(s).digest('hex')
}

function emptyPhase(): PhaseEntry {
  return { status: 'pending', consumed: [], produced: [], authorized_exit_by: null }
}

export function createPhaseJson(changeDir: string, changeId: string): PhaseJson {
  const pj: PhaseJson = {
    schema_version: '1.3',
    change_id: changeId,
    invariants: {
      require_artifact_hashes: true,
      require_provenance_chain: true,
      require_verdict_before_finish: true,
    },
    current_phase: 'intent',
    lifecycle: LIFECYCLE,
    phases: Object.fromEntries(LIFECYCLE.map(p => [p, emptyPhase()])) as Record<Phase, PhaseEntry>,
  }
  writePhaseJson(changeDir, pj)
  return pj
}

export function readPhaseJson(changeDir: string): PhaseJson {
  const p = phaseJsonPath(changeDir)
  if (!existsSync(p)) throw new Error(`phase.json not found at ${p} — run loomkit init`)
  return JSON.parse(readFileSync(p, 'utf-8')) as PhaseJson
}

export function writePhaseJson(changeDir: string, pj: PhaseJson): void {
  mkdirSync(changeDir, { recursive: true })
  writeFileSync(phaseJsonPath(changeDir), JSON.stringify(pj, null, 2) + '\n')
}

export function recordPhaseComplete(
  changeDir: string,
  phase: Phase,
  consumed: ArtifactRef[],
  produced: ArtifactRef[],
  exit: AuthorizedExit | null,
): void {
  const pj = readPhaseJson(changeDir)
  pj.phases[phase] = {
    status: 'complete',
    completed_at: new Date().toISOString(),
    consumed,
    produced,
    authorized_exit_by: exit,
  }
  pj.current_phase = phase
  writePhaseJson(changeDir, pj)
}

export function recordGateVerdict(changeDir: string, verdict: VerdictEntry): void {
  const pj = readPhaseJson(changeDir)
  pj.gate_code_verdict = verdict
  writePhaseJson(changeDir, pj)
}

function phaseJsonPath(changeDir: string): string {
  return join(changeDir, 'phase.json')
}
