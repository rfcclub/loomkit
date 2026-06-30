import { join } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { getChangeDir, changeExists } from '../utils.js'
import { createSelfCheckTemplate } from '../../harness/self-check.ts'

export function cmdSelfCheck(name: string): void {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`)
    process.exit(1)
  }

  const changeDir = getChangeDir(name)
  const selfCheckPath = join(changeDir, 'self-check.md')

  if (existsSync(selfCheckPath)) {
    console.log(`✓  self-check.md already exists at ${selfCheckPath}`)
    console.log('  Edit it to declare claims, evidence, limitations, and assumptions.')
    return
  }

  writeFileSync(selfCheckPath, createSelfCheckTemplate(), 'utf-8')
  console.log(`✓  Created ${selfCheckPath}`)
  console.log('  Fill in claims, evidence (JSON), known limitations, and unresolved assumptions.')
  console.log('  Then run: loomkit gate-code ' + name)
}
