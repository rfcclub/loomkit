import type { SelfCheckArtifact, EvidenceReference } from './types.js'

export function createSelfCheckTemplate(): string {
  return `# Self-Check

## Claims
- <!-- What did you implement? What does it do? -->

## Evidence
\`\`\`json
[]
\`\`\`

<!-- Evidence format:
[
  { "type": "command", "command": "bun test", "exit_code": 0, "output": "12 pass 0 fail" },
  { "type": "file", "file": "src/foo.ts", "content": "relevant snippet" }
]
-->

## Known Limitations
- <!-- What does this NOT handle? What edge cases were left? -->

## Unresolved Assumptions
- <!-- What did you assume that hasn't been verified? -->
`
}

export function parseSelfCheck(md: string): SelfCheckArtifact {
  return {
    claims: extractList(md, '## Claims'),
    evidence: extractEvidence(md),
    known_limitations: extractList(md, '## Known Limitations'),
    unresolved_assumptions: extractList(md, '## Unresolved Assumptions'),
  }
}

function extractEvidence(md: string): EvidenceReference[] {
  const match = md.match(/## Evidence\s*```json\s*([\s\S]*?)```/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[1]!.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function extractList(md: string, section: string): string[] {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = md.match(new RegExp(`${escaped}\\s*([\\s\\S]*?)(?=##|$)`))
  if (!match) return []
  return match[1]!
    .split('\n')
    .filter(l => l.trim().startsWith('- ') && !l.includes('<!--'))
    .map(l => l.replace(/^-\s+/, '').trim())
    .filter(Boolean)
}
