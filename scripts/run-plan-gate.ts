#!/usr/bin/env bun
// Runs SEAL plan_review gate on loomkit-harness-complete spec + tasks

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { Seal } from '../../seal-gate/src/index.ts'

const CHANGE = 'loomkit-harness-complete'
const CHANGE_DIR = join(import.meta.dir, '..', 'openspec', 'changes', CHANGE)
const SPEC_FILE = join(CHANGE_DIR, 'specs', CHANGE, 'spec.md')
const INTENT_FILE = join(CHANGE_DIR, 'intent.md')
const TASKS_FILE = join(CHANGE_DIR, 'tasks.md')

const spec = existsSync(SPEC_FILE) ? readFileSync(SPEC_FILE, 'utf-8') : ''
const intent = existsSync(INTENT_FILE) ? readFileSync(INTENT_FILE, 'utf-8') : ''
const tasks = existsSync(TASKS_FILE) ? readFileSync(TASKS_FILE, 'utf-8') : ''

// Artifact under review: tasks.md (the plan) measured against spec
const artifact = tasks

// Extract WHEN/THEN scenarios from spec as locked criteria
function extractCriteria(specContent: string): Array<{ id: string; text: string; source_file: string; source_line: number }> {
  const criteria: Array<{ id: string; text: string; source_file: string; source_line: number }> = []
  const lines = specContent.split('\n')
  let acIndex = 0
  let whenBuf = ''
  let thenBuf = ''
  let lineNum = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('#### Scenario:')) {
      if (whenBuf && thenBuf) {
        acIndex++
        criteria.push({
          id: `AC-${acIndex}`,
          text: `WHEN ${whenBuf.trim()} THEN ${thenBuf.trim()}`,
          source_file: 'spec.md',
          source_line: lineNum,
        })
      }
      whenBuf = ''
      thenBuf = ''
    } else if (line.startsWith('- **WHEN**')) {
      whenBuf += line.replace('- **WHEN**', '').trim() + ' '
      lineNum = i + 1
    } else if (line.startsWith('- **THEN**')) {
      thenBuf += line.replace('- **THEN**', '').trim() + ' '
    }
  }
  // Last scenario
  if (whenBuf && thenBuf) {
    acIndex++
    criteria.push({
      id: `AC-${acIndex}`,
      text: `WHEN ${whenBuf.trim()} THEN ${thenBuf.trim()}`,
      source_file: 'spec.md',
      source_line: lineNum,
    })
  }
  return criteria
}

const lockedCriteria = extractCriteria(spec)
console.log(`Loaded ${lockedCriteria.length} locked criteria from spec.md`)
console.log(`Artifact: tasks.md (${artifact.split('\n').length} lines)\n`)

const result = await Seal.review({
  artifact_type: 'plan_review',
  output: artifact,
  spec,
  context: {
    artifact_file: 'tasks.md',
    locked_criteria: lockedCriteria,
  },
})

console.log('=== SEAL PLAN_REVIEW GATE ===')
console.log(`Verdict:     ${result.verdict}`)
console.log(`Trust score: ${result.trust_score}`)
console.log(`Risk level:  ${result.risk_level}`)
console.log(`Summary:     ${result.summary}`)

if (result.blocking_issues.length > 0) {
  console.log(`\nBlocking issues (${result.blocking_issues.length}):`)
  for (const issue of result.blocking_issues) {
    console.log(`  [${issue.severity}] ${issue.rule_id ?? issue.type}: ${issue.evidence.slice(0, 100)}`)
  }
}

if (result.non_blocking_issues.length > 0) {
  console.log(`\nNon-blocking issues (${result.non_blocking_issues.length}):`)
  for (const issue of result.non_blocking_issues.slice(0, 8)) {
    console.log(`  [${issue.severity}] ${issue.rule_id ?? issue.type}: ${issue.evidence.slice(0, 100)}`)
  }
  if (result.non_blocking_issues.length > 8) {
    console.log(`  ... and ${result.non_blocking_issues.length - 8} more`)
  }
}

if (result.assumptions_detected.length > 0) {
  console.log(`\nAssumptions: ${result.assumptions_detected.join('; ').slice(0, 200)}`)
}

console.log(`\nNext: ${result.next_action}`)
process.exit(result.verdict === 'BLOCK' ? 1 : 0)
