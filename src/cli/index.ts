#!/usr/bin/env node

import { cmdInit } from './commands/init.js';
import { cmdIntent } from './commands/intent.js';
import { cmdSpec } from './commands/spec.js';
import { cmdDesign } from './commands/design.js';
import { cmdPlan } from './commands/plan.js';
import { cmdVerify } from './commands/verify.js';
import { cmdArchive } from './commands/archive.js';
import { cmdStatus } from './commands/status.js';
import { cmdAdapt } from './commands/adapt.js';
import { cmdPublish } from './commands/publish.js';
import { cmdShow } from './commands/show.js';
import { cmdSelfCheck } from './commands/self-check.js';
import { cmdGateCode } from './commands/gate-code.js';
import { cmdCraft } from './commands/craft.js';
import { cmdGatePipeline } from './commands/gate-pipeline.js';
import { cmdLearn } from './commands/learn.js';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'intent':
    if (!args[0]) { console.error('Usage: loomkit intent <name>'); process.exit(1); }
    cmdIntent(args[0]);
    break;
  case 'spec':
    if (!args[0]) { console.error('Usage: loomkit spec <name>'); process.exit(1); }
    cmdSpec(args[0]);
    break;
  case 'design':
    if (!args[0]) { console.error('Usage: loomkit design <name>'); process.exit(1); }
    cmdDesign(args[0]);
    break;
  case 'plan':
    if (!args[0]) { console.error('Usage: loomkit plan <name>'); process.exit(1); }
    cmdPlan(args[0]);
    break;
  case 'verify':
    cmdVerify(args[0] || undefined);
    break;
  case 'archive':
    if (!args[0]) { console.error('Usage: loomkit archive <name> [--force --reason="..."]'); process.exit(1); }
    const force = process.argv.includes('--force');
    const reasonIdx = process.argv.indexOf('--reason');
    const reason = reasonIdx >= 0 ? process.argv[reasonIdx + 1] : '';
    cmdArchive(args[0], { force, reason });
    break;
  case 'publish':
    const dryRun = process.argv.includes('--dry-run');
    cmdPublish({ dryRun });
    break;
  case 'show':
    cmdShow(args[0] || undefined);
    break;
  case 'status':
    cmdStatus();
    break;
  case 'adapt':
    if (!args[0]) { console.error('Usage: loomkit adapt <tool> (claude-code | codex)'); process.exit(1); }
    cmdAdapt(args[0]);
    break;
  case 'self-check':
    if (!args[0]) { console.error('Usage: loomkit self-check <name>'); process.exit(1); }
    cmdSelfCheck(args[0]);
    break;
  case 'gate-code':
    if (!args[0]) { console.error('Usage: loomkit gate-code <name> [--skip-state-check]'); process.exit(1); }
    await cmdGateCode(args[0], { skip: process.argv.includes('--skip-state-check') });
    break;
  case 'craft':
    if (!args[0]) { console.error('Usage: loomkit craft <name>'); process.exit(1); }
    cmdCraft(args[0]);
    break;
  case 'gate-pipeline':
    cmdGatePipeline();
    break;
  case 'learn':
    if (!args[0]) { console.error('Usage: loomkit learn <name>'); process.exit(1); }
    cmdLearn(args[0]);
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
}

main().catch(err => { console.error(err); process.exit(1); });

function printHelp(): void {
  console.log(`
LoomKit — Harness Engineering Framework

Usage: loomkit <command> [options]

Workflow commands:
  init                    Scaffold loomkit/ directory
  intent <name>           Create an intent artifact (problem, outcome, non-goals)
  spec <name>             Create a new change with proposal + spec
  design <name>           Add design.md to existing change
  plan <name>             Add tasks.md to existing change
  show [name]             Show change details (all changes if no name)
  verify [name]           Run coverage gate (all changes if no name)
  archive <name>          Archive verified change

Harness commands:
  self-check <name>       Scaffold self-check.md (claims, evidence, limitations)
  gate-code <name>        Run SEAL gate on current diff [--skip-state-check]
  craft <name>            Show craft review verdict (maintainability)
  gate-pipeline           Aggregate all change verdicts → SHIP/HOLD/ESCALATE
  learn <name>            Extract lessons from gate history

Other:
  publish [--dry-run]     Publish current version to npm
  status                  Show current changes + coverage
  adapt <tool>            Show adapter instructions (claude-code | codex)
  help                    Show this help
`);
}
