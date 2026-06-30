export interface TraceEntry {
  ac_id: string
  ac_text: string
  tasks: string[]
  tests: string[]
  files: string[]
  gate_issues: string[]
  verdict?: string
  timestamp?: string
}

export class TraceGraph {
  private entries: Map<string, TraceEntry> = new Map()

  addEntry(e: TraceEntry): void {
    this.entries.set(e.ac_id, { ...e, timestamp: new Date().toISOString() })
  }

  findByAC(id: string): TraceEntry | undefined {
    return this.entries.get(id)
  }

  findUntraced(allACs: string[]): string[] {
    return allACs.filter(id => !this.entries.has(id))
  }

  linkGateIssue(acId: string, issueCode: string): void {
    const entry = this.entries.get(acId)
    if (entry && !entry.gate_issues.includes(issueCode)) {
      entry.gate_issues.push(issueCode)
    }
  }

  toJSON(): TraceEntry[] {
    return [...this.entries.values()]
  }

  static fromJSON(data: TraceEntry[]): TraceGraph {
    const g = new TraceGraph()
    for (const e of data) g.entries.set(e.ac_id, e)
    return g
  }
}
