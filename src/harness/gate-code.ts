import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { execFileSync } from 'child_process'
import { parseSelfCheck } from './self-check.ts'
import { readPhaseJson, recordGateVerdict, sha256String } from './phase-json.ts'
import { TransitionGuard } from './transition-guard.ts'
import type { GateVerdict, VerdictEntry } from './types.ts'

export interface GateCodeResult {
  verdict: GateVerdict
  trust_score: number
  bound_diff_sha256: string
  blocking_issues: Array<{ type: string; severity: string; evidence: string; rule_id?: string }>
  next_action: string
  advisory_notes?: string[]
}

export async function runGateCode(opts: {
  changeDir: string
  skipStateCheck?: boolean
  sealReviewFn?: (input: unknown) => Promise<unknown>
}): Promise<GateCodeResult> {
  const guard = new TransitionGuard(opts.changeDir)
  guard.canEnter('gate-code', opts.skipStateCheck)

  const selfCheckPath = join(opts.changeDir, 'self-check.md')
  if (!existsSync(selfCheckPath)) {
    throw new Error('self-check.md required before gate-code — run loomkit self-check first')
  }

  const selfCheck = parseSelfCheck(readFileSync(selfCheckPath, 'utf-8'))

  // Find spec file
  const specContent = findSpecContent(opts.changeDir)

  // Capture current diff — binds this verdict to exact code state
  let diffOutput = ''
  try {
    diffOutput = execFileSync('git', ['diff', 'HEAD'], {
      cwd: opts.changeDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString()
  } catch {
    // Not in a git repo or no diff — proceed without binding
  }
  const diffSha256 = sha256String(diffOutput)

  // Load SEAL and TrustMemory
  const { Seal, TrustMemory } = await import('seal-gate')
  const trustMemoryPath = join(opts.changeDir, '.harness', 'trust-memory.json')
  const trustMemory = existsSync(trustMemoryPath)
    ? TrustMemory.fromJSON(JSON.parse(readFileSync(trustMemoryPath, 'utf-8')))
    : new TrustMemory()
  Seal.withTrustMemory(trustMemory)

  // Build SEAL evidence from self-check references
  const references = selfCheck.evidence
    .filter(e => e.type === 'command')
    .map(e => ({ type: 'command' as const, command: e.command ?? '', exit_code: e.exit_code ?? 0, output: e.output ?? '' }))

  const reviewFn = opts.sealReviewFn ?? ((input: unknown) => Seal.review(input as Parameters<typeof Seal.review>[0]))

  const sealResult = await reviewFn({
    artifact_type: 'code_diff',
    spec: specContent,
    output: diffOutput || selfCheck.claims.join('\n'),
    evidence: {
      diff: diffOutput,
      test_log: selfCheck.evidence.find(e => e.command?.includes('test'))?.output ?? '',
      build_log: '',
      references,
    },
    context: { agent_id: 'loomkit-agent', agent_role: 'developer' },
  }) as {
    verdict: GateVerdict
    trust_score: number
    blocking_issues: Array<{ type: string; severity: string; evidence: string; rule_id?: string }>
    next_action: string
    advisory_notes?: string[]
  }

  // Persist TrustMemory
  mkdirSync(join(opts.changeDir, '.harness'), { recursive: true })
  writeFileSync(trustMemoryPath, JSON.stringify(trustMemory.toJSON(), null, 2))

  // Build verdict entry for phase.json
  const testRef = selfCheck.evidence.find(e => e.command?.includes('test'))
  const verdictEntry: VerdictEntry = {
    verdict: sealResult.verdict,
    bound_diff_sha256: diffSha256,
    evidence_bound: {
      test_log_sha256: testRef?.output ? sha256String(testRef.output) : null,
      build_log_sha256: null,
    },
  }

  // Write verdict file
  const verdictDir = join(opts.changeDir, '.harness', 'gate-verdicts')
  mkdirSync(verdictDir, { recursive: true })
  writeFileSync(join(verdictDir, `${Date.now()}.json`), JSON.stringify({ ...sealResult, ...verdictEntry }, null, 2))

  // Update phase.json
  try {
    recordGateVerdict(opts.changeDir, verdictEntry)
  } catch {
    // phase.json may not exist in degraded mode
  }

  return {
    verdict: sealResult.verdict,
    trust_score: sealResult.trust_score,
    bound_diff_sha256: diffSha256,
    blocking_issues: sealResult.blocking_issues,
    next_action: sealResult.next_action,
    advisory_notes: sealResult.advisory_notes,
  }
}

function findSpecContent(changeDir: string): string | null {
  const specsDir = join(changeDir, 'specs')
  if (!existsSync(specsDir)) return null
  try {
    const subdirs = readdirSync(specsDir)
    for (const sub of subdirs) {
      const specFile = join(specsDir, sub, 'spec.md')
      if (existsSync(specFile)) return readFileSync(specFile, 'utf-8')
    }
  } catch { /* */ }
  return null
}
