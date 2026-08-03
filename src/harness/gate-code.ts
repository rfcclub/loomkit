import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { execFileSync } from 'child_process'
import { parseSelfCheck } from './self-check.js'
import { readPhaseJson, recordGateVerdict, sha256String } from './phase-json.js'
import { TransitionGuard } from './transition-guard.js'
import type { GateVerdict, VerdictEntry } from './types.js'

export interface GateCodeResult {
  verdict: GateVerdict
  trust_score: number
  bound_diff_sha256: string
  blocking_issues: Array<{ type: string; severity: string; evidence: string; rule_id?: string }>
  next_action: string
  advisory_notes?: string[]
  llm_hint?: string
}

export async function runGateCode(opts: {
  changeDir: string
  skipStateCheck?: boolean
  sealReviewFn?: (input: unknown) => Promise<unknown>
  llmProvider?: string
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
  const sealGate = await import('seal-gate')
  const { Seal } = sealGate
  const TrustMemory = (sealGate as Record<string, unknown>).TrustMemory as
    | { fromJSON(data: Record<string, unknown[]>): { toJSON(): unknown }; new(): { toJSON(): unknown } }
    | undefined
  const trustMemoryPath = join(opts.changeDir, '.harness', 'trust-memory.json')
  let trustMemory: { toJSON(): unknown } | null = null
  if (TrustMemory) {
    trustMemory = existsSync(trustMemoryPath)
      ? TrustMemory.fromJSON(JSON.parse(readFileSync(trustMemoryPath, 'utf-8')))
      : new TrustMemory()
    Seal.withTrustMemory(trustMemory as never)
  }

  // Wire LLM reviewer if --llm was passed
  let llmHint: string | undefined
  if (opts.llmProvider !== undefined) {
    try {
      const { createReviewer, Seal: SealModule } = await import('seal-gate')
      if (typeof createReviewer === 'function') {
        const provider = opts.llmProvider || undefined  // empty string → auto-detect
        SealModule.withLLM(createReviewer({ provider }) as never)
      }
    } catch {
      // seal-gate < 0.4.0 doesn't export createReviewer — skip silently
    }
  }

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
  if (trustMemory) {
    mkdirSync(join(opts.changeDir, '.harness'), { recursive: true })
    writeFileSync(trustMemoryPath, JSON.stringify(trustMemory.toJSON(), null, 2))
  }

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

  // Detect LLM hint from assumptions
  if (opts.llmProvider !== undefined) {
    const assumptions = (sealResult as Record<string, unknown>).assumptions_detected as string[] | undefined
    if (assumptions?.some(a => typeof a === 'string' && a.includes('L2') && (a.includes('not reviewed') || a.includes('error')))) {
      llmHint = '💡 Tip: Set an API key env var (MINIMAX_PLAN_KEY, FIREWORKS_API_KEY, GEMINI_API_KEY, etc.) to enable LLM review.'
    }
  }

  return {
    verdict: sealResult.verdict,
    trust_score: sealResult.trust_score,
    bound_diff_sha256: diffSha256,
    blocking_issues: sealResult.blocking_issues,
    next_action: sealResult.next_action,
    advisory_notes: sealResult.advisory_notes,
    llm_hint: llmHint,
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
