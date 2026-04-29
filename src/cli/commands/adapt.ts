import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { getLoomKitDir } from '../utils.js';

export function cmdAdapt(tool: string): void {
  const loomkitDir = getLoomKitDir();
  const adaptersDir = join(loomkitDir, 'adapters');

  const validTools = ['claude-code', 'codex'];

  if (!validTools.includes(tool)) {
    console.error(`✗  Unknown tool "${tool}". Supported: ${validTools.join(', ')}`);
    process.exit(1);
  }

  const adapterDir = join(adaptersDir, tool);
  if (!existsSync(adapterDir)) {
    console.error(`✗  Adapter for "${tool}" not found. Check loomkit/adapters/`);
    process.exit(1);
  }

  console.log(`\n✓  LoomKit adapter for ${tool}:`);
  console.log(`  ${adapterDir}/`);

  const files = readdirSync(adapterDir);
  for (const file of files) {
    console.log(`    ${file}`);
  }

  console.log(`\nInstructions:`);
  if (tool === 'claude-code') {
    console.log(`  1. Run: cd ${adapterDir} && ./generate-skills.sh`);
    console.log(`  2. Copy CLAUDE.md content or merge into project CLAUDE.md`);
  } else if (tool === 'codex') {
    console.log(`  1. Run: cd ${adapterDir} && ./generate-instructions.sh`);
    console.log(`  2. Copy AGENTS.md content or merge into project AGENTS.md`);
  }
}
