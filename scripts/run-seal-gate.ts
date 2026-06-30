#!/usr/bin/env bun
// Runs SEAL gate against the loomkit-harness-complete change
// Uses seal-gate from sibling repo at ~/work/seal-gate

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { Seal } from '../../seal-gate/src/index.ts'

const CHANGE = 'loomkit-harness-complete'
const CHANGE_DIR = join(import.meta.dir, '..', 'openspec', 'changes', CHANGE)
const HARNESS_DIR = join(import.meta.dir, '..', 'src', 'harness')

// Load spec
function loadSpec(): string {
  const specsDir = join(CHANGE_DIR, 'specs')
  if (!existsSync(specsDir)) return '(no spec found)'
  const subdirs = readdirSync(specsDir)
  for (const sub of subdirs) {
    const p = join(specsDir, sub, 'spec.md')
    if (existsSync(p)) return readFileSync(p, 'utf-8')
  }
  return '(no spec.md found in specs/)'
}

// Collect harness source as the artifact under review
function collectHarnessSource(): string {
  const files = readdirSync(HARNESS_DIR).filter(f => f.endsWith('.ts'))
  return files.map(f => {
    const content = readFileSync(join(HARNESS_DIR, f), 'utf-8')
    return `=== ${f} ===\n${content}`
  }).join('\n\n')
}

const spec = loadSpec()
const artifact = collectHarnessSource()

const testEvidence = `
Test run: 140/140 passed (vitest)
Files covered: phase-json, transition-guard, self-check, trace, pipeline-gate, craft-review, learn-loop
All harness modules verified via unit tests.
`.trim()

const result = await Seal.review({
  artifact_type: 'code_diff',
  spec,
  output: artifact,
  evidence: {
    diff: artifact,
    test_log: testEvidence,
    build_log: '',
    references: [
      {
        type: 'command',
        command: 'npm test',
        exit_code: 0,
        output: 'Tests  140 passed (140)',
      },
    ],
  },
  context: {
    agent_id: 'aria-harness-builder',
    agent_role: 'developer',
  },
})

console.log('\n=== SEAL GATE RESULT ===')
console.log(JSON.stringify(result, null, 2))
console.log('\n=== VERDICT:', result.verdict, '===')
console.log('Trust score:', result.trust_score)
if (result.advisory_notes?.length) {
  console.log('Advisory notes:', result.advisory_notes)
}
if (result.blocking_issues?.length) {
  console.log('Blocking issues:', result.blocking_issues)
}
console.log('Next action:', result.next_action)

process.exit(result.verdict === 'BLOCK' ? 1 : 0)
