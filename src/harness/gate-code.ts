import { createHash } from 'crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { execFileSync } from 'child_process'
import { parseSelfCheck } from './self-check.js'
import { readPhaseJson, recordGateVerdict, sha256String } from './phase-json.js'
import { readPlanJson } from './plan-json.js'
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

  // Level 2b — mutation-probe each plan task's test to confirm it pins its behavior.
  // Unpinned tests (mutation survived) fold a SPEC_UNTESTED advisory + trust drop into the result.
  const resultWithProbe = await probePlanTasks(sealResult, opts.changeDir)

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
  writeFileSync(join(verdictDir, `${Date.now()}.json`), JSON.stringify({ ...resultWithProbe.result, ...verdictEntry }, null, 2))

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
    verdict: resultWithProbe.result.verdict,
    trust_score: resultWithProbe.result.trust_score,
    bound_diff_sha256: diffSha256,
    blocking_issues: resultWithProbe.result.blocking_issues,
    next_action: resultWithProbe.result.next_action,
    advisory_notes: resultWithProbe.result.advisory_notes,
    llm_hint: llmHint,
  }
}

/**
 * Level 2b mutation-probe integration. Reads plan.json (if present), and for each task that
 * carries a `test`, runs the mutation probe to confirm the test actually pins its behavior.
 * Unpinned tests fold a SPEC_UNTESTED advisory + a small trust drop into the result.
 */
async function probePlanTasks<T extends { advisory_notes?: string[]; trust_score: number }>(
  result: T,
  changeDir: string,
): Promise<{ result: T; probed: boolean }> {
  const planPath = join(changeDir, 'plan.json')
  if (!existsSync(planPath)) {
    return { result, probed: false }
  }

  let plan: ReturnType<typeof readPlanJson>
  try {
    plan = readPlanJson(changeDir)
  } catch {
    return { result, probed: false }
  }

  const testTasks = plan.tasks.filter(t => t.test && (t.status === 'complete' || t.status === 'in_progress'))
  if (testTasks.length === 0) {
    return { result, probed: false }
  }

  let checkTestPinsBehavior: (opts: {
    test_file: string
    run_command: [string, string[]]
    workdir: string
  }) => Promise<
    { pinned: true; survivors: string[] } | { pinned: false; survivors: string[] } | { skipped: true; reason: string }
  >
  try {
    ({ checkTestPinsBehavior } = await import('seal-gate'))
  } catch {
    return { result, probed: false } // seal-gate <0.5 lacks it
  }
  if (typeof checkTestPinsBehavior !== 'function') return { result, probed: false }

  const advisory = [...(result.advisory_notes ?? [])]
  let trustDrop = 0

  for (const task of testTasks) {
    const testFile = resolve(join(changeDir, '..', task.test))
    if (!existsSync(testFile)) {
      advisory.push(`mutation-probe: ${task.id} — test file not found: ${task.test}`)
      continue
    }
    let outcome: Awaited<ReturnType<typeof checkTestPinsBehavior>>
    try {
      outcome = await checkTestPinsBehavior({
        test_file: testFile,
        run_command: ['bun', ['test', testFile]],
        workdir: resolve(join(changeDir, '..')),
      })
    } catch {
      continue
    }
    if ('skipped' in outcome && outcome.skipped) continue
    if ('pinned' in outcome && outcome.pinned === false) {
      advisory.push(`mutation-probe: ${task.id} — test does NOT pin its behavior (SPEC_UNTESTED); ${outcome.survivors.length} survivor(s)`)
      trustDrop += 3
    }
  }

  if (advisory.length === 0 && trustDrop === 0) return { result, probed: true }

  return {
    result: {
      ...result,
      advisory_notes: advisory,
      trust_score: Math.max(0, result.trust_score - trustDrop),
    },
    probed: true,
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
