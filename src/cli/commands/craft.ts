import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { getChangeDir, changeExists } from '../utils.js'
import { parseCraftVerdict, CRAFT_PROMPT } from '../../harness/craft-review.js'

export function cmdCraft(name: string): void {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`)
    process.exit(1)
  }

  const changeDir = getChangeDir(name)
  const craftPath = join(changeDir, '.harness', 'craft-verdict.yaml')

  if (!existsSync(craftPath)) {
    console.log(`No craft verdict found for "${name}".`)
    console.log('\nTo get a craft review, ask an LLM to review your diff using this prompt:')
    console.log('\n--- CRAFT REVIEW PROMPT ---')
    console.log(CRAFT_PROMPT)
    console.log('--- END PROMPT ---')
    console.log(`\nThen save the YAML output to: ${craftPath}`)
    return
  }

  const yaml = readFileSync(craftPath, 'utf-8')
  const result = parseCraftVerdict(yaml)

  const icon = result.verdict === 'ACCEPTABLE' ? '✓' : result.blocks_finish ? '✗' : '⚠'
  console.log(`\n${icon}  Craft verdict: ${result.verdict}`)

  if (result.must_fix.length > 0) {
    console.log('  Must fix:')
    for (const issue of result.must_fix) {
      console.log(`    [${issue.severity}] ${issue.dimension ?? ''}: ${issue.text}`)
    }
  }

  if (result.nice_to_have.length > 0) {
    console.log('  Nice to have:')
    for (const item of result.nice_to_have) console.log(`    - ${item}`)
  }

  if (result.blocks_finish) {
    console.error('\n  ✗  This craft verdict blocks finish. Address HIGH severity issues first.')
    process.exit(1)
  }
}
