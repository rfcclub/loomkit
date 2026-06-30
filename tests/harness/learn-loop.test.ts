import { describe, it, expect } from 'vitest'
import { extractLessons, formatLessonsMarkdown, generatePolicyDiff } from '../../src/harness/learn-loop.ts'
import type { GateHistoryEntry } from '../../src/harness/learn-loop.ts'

const passingHistory: GateHistoryEntry[] = [
  { verdict: 'PASS', change: 'feat-a', trust_score: 90 },
  { verdict: 'PASS_WITH_WARNINGS', change: 'feat-b', trust_score: 80 },
]

const mixedHistory: GateHistoryEntry[] = [
  { verdict: 'PASS', change: 'feat-a' },
  { verdict: 'BLOCK', change: 'feat-b', issues: [{ rule_id: 'R001', message: 'Missing rollback' }] },
  { verdict: 'REVISE', change: 'feat-c', issues: [{ code: 'CL401', message: 'Overconfident claim' }] },
]

describe('extractLessons', () => {
  it('extracts what passed', () => {
    const lessons = extractLessons(passingHistory)
    expect(lessons.what_passed).toContain('feat-a')
    expect(lessons.what_passed).toContain('feat-b')
  })

  it('extracts what was caught from blocked/revised', () => {
    const lessons = extractLessons(mixedHistory)
    expect(lessons.what_was_caught).toContain('Missing rollback')
    expect(lessons.what_was_caught).toContain('Overconfident claim')
  })

  it('auto_applied is always false', () => {
    const lessons = extractLessons(mixedHistory)
    expect(lessons.auto_applied).toBe(false)
  })

  it('policy_candidates come from BLOCK and REVISE verdicts', () => {
    const lessons = extractLessons(mixedHistory)
    expect(lessons.policy_candidates.some(p => p.includes('R001'))).toBe(true)
  })

  it('empty history yields empty arrays', () => {
    const lessons = extractLessons([])
    expect(lessons.what_passed).toHaveLength(0)
    expect(lessons.what_was_caught).toHaveLength(0)
    expect(lessons.policy_candidates).toHaveLength(0)
  })
})

describe('formatLessonsMarkdown', () => {
  it('outputs required section headers', () => {
    const lessons = extractLessons(mixedHistory)
    const md = formatLessonsMarkdown(lessons)
    expect(md).toContain('## What Passed')
    expect(md).toContain('## What Gate Caught')
    expect(md).toContain('## Policy Candidates')
    expect(md).toContain('## Gate Misses')
  })

  it('notes auto_applied: false', () => {
    const md = formatLessonsMarkdown(extractLessons([]))
    expect(md).toContain('auto_applied: false')
  })
})

describe('generatePolicyDiff', () => {
  it('returns empty string when no policy candidates', () => {
    expect(generatePolicyDiff(extractLessons(passingHistory))).toBe('')
  })

  it('generates candidate YAML for blocked issues', () => {
    const lessons = extractLessons(mixedHistory)
    const diff = generatePolicyDiff(lessons)
    expect(diff).toContain('gate-policy.diff.yml')
    expect(diff).toContain('status: candidate')
    expect(diff).toContain('source: learn_loop')
  })

  it('marks output as review-before-applying', () => {
    const lessons = extractLessons(mixedHistory)
    const diff = generatePolicyDiff(lessons)
    expect(diff).toContain('REVIEW BEFORE APPLYING')
  })
})
