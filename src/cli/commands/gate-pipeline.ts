import { join } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { listChanges, getChangeDir } from '../utils.js'
import { runPipelineGate } from '../../harness/pipeline-gate.js'
import type { PipelineVerdictEntry } from '../../harness/pipeline-gate.js'

export function cmdGatePipeline(): void {
  const changes = listChanges()

  if (changes.length === 0) {
    console.log('No changes found. Nothing to gate.')
    return
  }

  const verdicts: PipelineVerdictEntry[] = []

  for (const change of changes) {
    const changeDir = getChangeDir(change)
    const verdictDir = join(changeDir, '.harness', 'gate-verdicts')

    if (!existsSync(verdictDir)) {
      verdicts.push({ verdict: undefined as unknown as 'PASS', change })
      continue
    }

    const files = readdirSync(verdictDir).filter(f => f.endsWith('.json')).sort()
    if (files.length === 0) {
      verdicts.push({ verdict: undefined as unknown as 'PASS', change })
      continue
    }

    const latest = JSON.parse(readFileSync(join(verdictDir, files[files.length - 1]), 'utf-8'))
    verdicts.push({ verdict: latest.verdict, change, trust_score: latest.trust_score })
  }

  const result = runPipelineGate(verdicts)
  const icon = result.decision === 'SHIP' ? '✓' : '✗'

  console.log(`\n${icon}  Pipeline decision: ${result.decision}`)
  console.log(`  ${result.summary}`)

  if (result.aggregate_trust_score !== undefined) {
    console.log(`  Aggregate trust score: ${result.aggregate_trust_score}`)
  }

  if (result.blocking && result.blocking.length > 0) {
    console.log('  Blocking changes:')
    for (const b of result.blocking) console.log(`    - ${b}`)
  }

  if (result.decision !== 'SHIP') process.exit(1)
}
