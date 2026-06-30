import { describe, it, expect } from 'vitest'
import { TraceGraph } from '../../src/harness/trace.ts'
import type { TraceEntry } from '../../src/harness/trace.ts'

const makeEntry = (id: string): TraceEntry => ({
  ac_id: id,
  ac_text: `Acceptance criterion ${id}`,
  tasks: [`task-${id}`],
  tests: [`test-${id}`],
  files: [`src/${id}.ts`],
  gate_issues: [],
})

describe('TraceGraph', () => {
  it('addEntry and findByAC works', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    const e = g.findByAC('AC-1')
    expect(e?.ac_text).toContain('AC-1')
  })

  it('findByAC returns undefined for missing id', () => {
    const g = new TraceGraph()
    expect(g.findByAC('UNKNOWN')).toBeUndefined()
  })

  it('findUntraced returns missing AC ids', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    const untraced = g.findUntraced(['AC-1', 'AC-2', 'AC-3'])
    expect(untraced).toContain('AC-2')
    expect(untraced).toContain('AC-3')
    expect(untraced).not.toContain('AC-1')
  })

  it('linkGateIssue attaches issue to entry', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    g.linkGateIssue('AC-1', 'CL401')
    const e = g.findByAC('AC-1')
    expect(e?.gate_issues).toContain('CL401')
  })

  it('linkGateIssue deduplicates issues', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    g.linkGateIssue('AC-1', 'CL401')
    g.linkGateIssue('AC-1', 'CL401')
    expect(g.findByAC('AC-1')?.gate_issues.filter(x => x === 'CL401')).toHaveLength(1)
  })

  it('toJSON returns all entries', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    g.addEntry(makeEntry('AC-2'))
    const json = g.toJSON()
    expect(json).toHaveLength(2)
  })

  it('fromJSON round-trips', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    const json = g.toJSON()
    const g2 = TraceGraph.fromJSON(json)
    expect(g2.findByAC('AC-1')?.ac_text).toContain('AC-1')
  })

  it('addEntry sets timestamp', () => {
    const g = new TraceGraph()
    g.addEntry(makeEntry('AC-1'))
    expect(g.findByAC('AC-1')?.timestamp).toBeDefined()
  })
})
