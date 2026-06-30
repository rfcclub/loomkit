import { describe, it, expect } from 'vitest'
import { runPipelineGate } from '../../src/harness/pipeline-gate.ts'
import type { PipelineVerdictEntry } from '../../src/harness/pipeline-gate.ts'

describe('runPipelineGate', () => {
  it('HOLD with no verdicts', () => {
    const result = runPipelineGate([])
    expect(result.decision).toBe('HOLD')
  })

  it('SHIP when all changes pass', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'PASS', change: 'feat-a', trust_score: 90 },
      { verdict: 'PASS_WITH_WARNINGS', change: 'feat-b', trust_score: 80 },
    ]
    expect(runPipelineGate(verdicts).decision).toBe('SHIP')
  })

  it('HOLD when any verdict is BLOCK', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'PASS', change: 'a' },
      { verdict: 'BLOCK', change: 'b' },
    ]
    const result = runPipelineGate(verdicts)
    expect(result.decision).toBe('HOLD')
    expect(result.blocking).toContain('b')
  })

  it('ESCALATE when 3+ REVISE verdicts', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'REVISE', change: 'a' },
      { verdict: 'REVISE', change: 'b' },
      { verdict: 'REVISE', change: 'c' },
    ]
    expect(runPipelineGate(verdicts).decision).toBe('ESCALATE_TO_HUMAN')
  })

  it('SHIP with only 2 REVISE verdicts (not 3)', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'REVISE', change: 'a' },
      { verdict: 'REVISE', change: 'b' },
      { verdict: 'PASS', change: 'c' },
    ]
    // Only 2 REVISE — should SHIP (not escalate)
    expect(runPipelineGate(verdicts).decision).toBe('SHIP')
  })

  it('ESCALATE when any verdict is ESCALATE_TO_HUMAN', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'PASS', change: 'a' },
      { verdict: 'ESCALATE_TO_HUMAN', change: 'b' },
    ]
    expect(runPipelineGate(verdicts).decision).toBe('ESCALATE_TO_HUMAN')
  })

  it('computes aggregate trust score', () => {
    const verdicts: PipelineVerdictEntry[] = [
      { verdict: 'PASS', change: 'a', trust_score: 80 },
      { verdict: 'PASS', change: 'b', trust_score: 100 },
    ]
    const result = runPipelineGate(verdicts)
    expect(result.aggregate_trust_score).toBe(90)
  })

  it('HOLD when any change has no verdict (ungated)', () => {
    const verdicts = [
      { verdict: 'PASS' as const, change: 'a' },
      { change: 'b' } as PipelineVerdictEntry,
    ]
    // Force ungated scenario by passing entry without verdict
    const ungatedVerdicts = [
      { verdict: 'PASS' as const, change: 'a' },
      { verdict: undefined as unknown as 'PASS', change: 'b' },
    ]
    const result = runPipelineGate(ungatedVerdicts)
    expect(result.decision).toBe('HOLD')
  })
})
