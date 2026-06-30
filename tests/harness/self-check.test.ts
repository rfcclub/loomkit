import { describe, it, expect } from 'vitest'
import { createSelfCheckTemplate, parseSelfCheck } from '../../src/harness/self-check.ts'

describe('self-check', () => {
  it('createSelfCheckTemplate returns a string with required sections', () => {
    const tmpl = createSelfCheckTemplate()
    expect(tmpl).toContain('## Claims')
    expect(tmpl).toContain('## Evidence')
    expect(tmpl).toContain('## Known Limitations')
    expect(tmpl).toContain('## Unresolved Assumptions')
  })

  it('parseSelfCheck extracts claims from bullet list', () => {
    const md = `## Claims\n- All tests pass\n- No regressions\n\n## Evidence\n\n## Known Limitations\n\n## Unresolved Assumptions\n`
    const result = parseSelfCheck(md)
    expect(result.claims).toContain('All tests pass')
    expect(result.claims).toContain('No regressions')
  })

  it('parseSelfCheck extracts evidence from JSON fence', () => {
    const json = JSON.stringify([{ type: 'command', command: 'bun test', exit_code: 0, output: 'OK' }])
    const md = `## Claims\n- done\n\n## Evidence\n\`\`\`json\n${json}\n\`\`\`\n\n## Known Limitations\n\n## Unresolved Assumptions\n`
    const result = parseSelfCheck(md)
    expect(result.evidence).toHaveLength(1)
    expect(result.evidence[0].command).toBe('bun test')
    expect(result.evidence[0].exit_code).toBe(0)
  })

  it('parseSelfCheck returns empty arrays for missing sections', () => {
    const result = parseSelfCheck('(empty doc)')
    expect(result.claims).toEqual([])
    expect(result.evidence).toEqual([])
    expect(result.known_limitations).toEqual([])
    expect(result.unresolved_assumptions).toEqual([])
  })

  it('parseSelfCheck extracts known limitations', () => {
    const md = `## Claims\n\n## Evidence\n\n## Known Limitations\n- No Windows support\n\n## Unresolved Assumptions\n`
    const result = parseSelfCheck(md)
    expect(result.known_limitations).toContain('No Windows support')
  })

  it('parseSelfCheck extracts unresolved assumptions', () => {
    const md = `## Claims\n\n## Evidence\n\n## Known Limitations\n\n## Unresolved Assumptions\n- DB schema is stable\n`
    const result = parseSelfCheck(md)
    expect(result.unresolved_assumptions).toContain('DB schema is stable')
  })

  it('parseSelfCheck tolerates malformed JSON fence gracefully', () => {
    const md = `## Claims\n- ok\n\n## Evidence\n\`\`\`json\n{bad json\n\`\`\`\n\n## Known Limitations\n\n## Unresolved Assumptions\n`
    const result = parseSelfCheck(md)
    expect(result.evidence).toEqual([])
  })
})
