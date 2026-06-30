import { describe, it, expect } from 'vitest'
import { parseCraftVerdict, CRAFT_PROMPT } from '../../src/harness/craft-review.ts'

const yamlAcceptable = `verdict: ACCEPTABLE\nmust_fix: []\nnice_to_have:\n  - "Consider renaming"\n`
const yamlImprove = `verdict: IMPROVE_BEFORE_PR\nmust_fix:\n  - text: "Naming unclear"\n    severity: MEDIUM\n    dimension: naming\nnice_to_have: []\n`
const yamlRefactorHighSeverity = `verdict: REFACTOR_RECOMMENDED\nmust_fix:\n  - text: "God object anti-pattern"\n    severity: HIGH\n    dimension: arch\nnice_to_have: []\n`
const yamlRefactorLowSeverity = `verdict: REFACTOR_RECOMMENDED\nmust_fix:\n  - text: "Minor naming issue"\n    severity: LOW\n    dimension: naming\nnice_to_have: []\n`

describe('parseCraftVerdict', () => {
  it('parses ACCEPTABLE verdict', () => {
    const result = parseCraftVerdict(yamlAcceptable)
    expect(result.verdict).toBe('ACCEPTABLE')
    expect(result.blocks_finish).toBe(false)
  })

  it('parses IMPROVE_BEFORE_PR with must_fix', () => {
    const result = parseCraftVerdict(yamlImprove)
    expect(result.verdict).toBe('IMPROVE_BEFORE_PR')
    expect(result.must_fix).toHaveLength(1)
    expect(result.must_fix[0].severity).toBe('MEDIUM')
    expect(result.blocks_finish).toBe(false)
  })

  it('REFACTOR_RECOMMENDED + HIGH severity blocks_finish', () => {
    const result = parseCraftVerdict(yamlRefactorHighSeverity)
    expect(result.verdict).toBe('REFACTOR_RECOMMENDED')
    expect(result.blocks_finish).toBe(true)
  })

  it('REFACTOR_RECOMMENDED + LOW severity does NOT block_finish', () => {
    const result = parseCraftVerdict(yamlRefactorLowSeverity)
    expect(result.verdict).toBe('REFACTOR_RECOMMENDED')
    expect(result.blocks_finish).toBe(false)
  })

  it('includes nice_to_have list', () => {
    const result = parseCraftVerdict(yamlAcceptable)
    expect(result.nice_to_have).toContain('Consider renaming')
  })

  it('defaults severity to MEDIUM for unknown values', () => {
    const yaml = `verdict: IMPROVE_BEFORE_PR\nmust_fix:\n  - text: "Bad"\n    severity: UNKNOWN_LEVEL\nnice_to_have: []\n`
    const result = parseCraftVerdict(yaml)
    expect(result.must_fix[0].severity).toBe('MEDIUM')
  })

  it('CRAFT_PROMPT covers all 6 dimensions', () => {
    expect(CRAFT_PROMPT).toContain('Simplicity')
    expect(CRAFT_PROMPT).toContain('Naming')
    expect(CRAFT_PROMPT).toContain('Locality')
    expect(CRAFT_PROMPT).toContain('Architectural')
    expect(CRAFT_PROMPT).toContain('Test clarity')
    expect(CRAFT_PROMPT).toContain('Maintenance')
  })
})
