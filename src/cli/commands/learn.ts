import { join } from 'path'
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs'
import { getChangeDir, changeExists } from '../utils.js'
import { extractLessons, formatLessonsMarkdown, generatePolicyDiff } from '../../harness/learn-loop.js'
import type { GateHistoryEntry } from '../../harness/learn-loop.js'

export function cmdLearn(name: string): void {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`)
    process.exit(1)
  }

  const changeDir = getChangeDir(name)
  const verdictDir = join(changeDir, '.harness', 'gate-verdicts')

  const history: GateHistoryEntry[] = []

  if (existsSync(verdictDir)) {
    const files = readdirSync(verdictDir).filter(f => f.endsWith('.json')).sort()
    for (const file of files) {
      try {
        const data = JSON.parse(readFileSync(join(verdictDir, file), 'utf-8'))
        history.push({
          verdict: data.verdict,
          change: name,
          issues: data.blocking_issues ?? [],
          trust_score: data.trust_score,
          timestamp: data.timestamp ?? file.replace('.json', ''),
        })
      } catch { /* skip corrupt file */ }
    }
  }

  if (history.length === 0) {
    console.log(`No gate history for "${name}". Run gate-code first.`)
    return
  }

  const lessons = extractLessons(history)
  const md = formatLessonsMarkdown(lessons)
  const policyDiff = generatePolicyDiff(lessons)

  const lessonsDir = join(changeDir, '.harness')
  mkdirSync(lessonsDir, { recursive: true })

  const lessonsPath = join(lessonsDir, 'lessons.md')
  writeFileSync(lessonsPath, md, 'utf-8')
  console.log(`✓  Lessons written to ${lessonsPath}`)

  if (policyDiff) {
    const diffPath = join(lessonsDir, 'gate-policy.diff.yml')
    writeFileSync(diffPath, policyDiff, 'utf-8')
    console.log(`⚠   Policy candidates written to ${diffPath}`)
    console.log('  Review before applying to gate-policy.yml — do NOT auto-apply.')
  }

  console.log(`\n  What passed: ${lessons.what_passed.length}`)
  console.log(`  What was caught: ${lessons.what_was_caught.length}`)
  console.log(`  Policy candidates: ${lessons.policy_candidates.length}`)
}
