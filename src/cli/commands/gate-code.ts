import { getChangeDir, changeExists } from '../utils.js'
import { runGateCode } from '../../harness/gate-code.js'

export async function cmdGateCode(name: string, opts: { skip?: boolean; llm?: string } = {}): Promise<void> {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`)
    process.exit(1)
  }

  const changeDir = getChangeDir(name)

  console.log(`Running SEAL gate on "${name}"...`)
  try {
    const result = await runGateCode({ changeDir, skipStateCheck: opts.skip, llmProvider: opts.llm })
    const icon = result.verdict === 'PASS' || result.verdict === 'PASS_WITH_WARNINGS' ? '✓' : '✗'
    console.log(`\n${icon}  Verdict: ${result.verdict}`)
    console.log(`  Trust score: ${result.trust_score}`)
    console.log(`  Diff SHA256: ${result.bound_diff_sha256.slice(0, 16)}...`)

    if (result.advisory_notes?.length) {
      console.log('  Advisory notes:')
      for (const note of result.advisory_notes) console.log(`    - ${note}`)
    }

    if (result.blocking_issues?.length) {
      console.log('  Blocking issues:')
      for (const issue of result.blocking_issues) {
        console.log(`    [${issue.severity}] ${issue.type}: ${issue.evidence}`)
      }
    }

    if (result.llm_hint) {
      console.log(`\n  ${result.llm_hint}`)
    }

    console.log(`\n  Next: ${result.next_action}`)
    if (result.verdict === 'BLOCK' || result.verdict === 'REVISE') process.exit(1)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`✗  Gate failed: ${msg}`)
    process.exit(1)
  }
}
