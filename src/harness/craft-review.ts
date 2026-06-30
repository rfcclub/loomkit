import { parse as parseYaml } from 'yaml'

export type CraftVerdict = 'ACCEPTABLE' | 'IMPROVE_BEFORE_PR' | 'REFACTOR_RECOMMENDED'

export interface CraftIssue {
  text: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  dimension?: string
}

export interface CraftResult {
  verdict: CraftVerdict
  must_fix: CraftIssue[]
  nice_to_have: string[]
  blocks_finish: boolean
}

export function parseCraftVerdict(yaml: string): CraftResult {
  const data = parseYaml(yaml) as {
    verdict: CraftVerdict
    must_fix?: Array<{ text: string; severity: string; dimension?: string }>
    nice_to_have?: string[]
  }
  const must_fix: CraftIssue[] = (data.must_fix ?? []).map(i => ({
    text: String(i.text ?? ''),
    severity: (['LOW', 'MEDIUM', 'HIGH'].includes(i.severity) ? i.severity : 'MEDIUM') as CraftIssue['severity'],
    dimension: i.dimension,
  }))
  const blocks_finish =
    data.verdict === 'REFACTOR_RECOMMENDED' && must_fix.some(i => i.severity === 'HIGH')

  return {
    verdict: data.verdict ?? 'ACCEPTABLE',
    must_fix,
    nice_to_have: data.nice_to_have ?? [],
    blocks_finish,
  }
}

export const CRAFT_PROMPT = `Review the following code change for maintainability across 6 dimensions:
1. Simplicity — is it as simple as it can be?
2. Naming/readability — clear names, self-documenting?
3. Locality of change — change is well-scoped?
4. Architectural fit — consistent with existing patterns?
5. Test clarity — tests readable and focused?
6. Maintenance risk — will this be painful to change later?

Output YAML only:
verdict: ACCEPTABLE | IMPROVE_BEFORE_PR | REFACTOR_RECOMMENDED
must_fix:
  - text: "description"
    severity: LOW | MEDIUM | HIGH
    dimension: naming | simplicity | locality | arch | tests | maintenance
nice_to_have:
  - "suggestion"

Only REFACTOR_RECOMMENDED with severity HIGH blocks finish. Be precise and brief.`
