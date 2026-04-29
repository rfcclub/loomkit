#!/usr/bin/env node
import { cmdInit } from './commands/init.js';
import { cmdSpec } from './commands/spec.js';
import { cmdDesign } from './commands/design.js';
import { cmdPlan } from './commands/plan.js';
import { cmdVerify } from './commands/verify.js';
import { cmdArchive } from './commands/archive.js';
import { cmdStatus } from './commands/status.js';
import { cmdAdapt } from './commands/adapt.js';
import { cmdPublish } from './commands/publish.js';
const command = process.argv[2];
const args = process.argv.slice(3);
switch (command) {
    case 'init':
        cmdInit();
        break;
    case 'spec':
        if (!args[0]) {
            console.error('Usage: loomkit spec <name>');
            process.exit(1);
        }
        cmdSpec(args[0]);
        break;
    case 'design':
        if (!args[0]) {
            console.error('Usage: loomkit design <name>');
            process.exit(1);
        }
        cmdDesign(args[0]);
        break;
    case 'plan':
        if (!args[0]) {
            console.error('Usage: loomkit plan <name>');
            process.exit(1);
        }
        cmdPlan(args[0]);
        break;
    case 'verify':
        cmdVerify(args[0] || undefined);
        break;
    case 'archive':
        if (!args[0]) {
            console.error('Usage: loomkit archive <name> [--force --reason="..."]');
            process.exit(1);
        }
        const force = process.argv.includes('--force');
        const reasonIdx = process.argv.indexOf('--reason');
        const reason = reasonIdx >= 0 ? process.argv[reasonIdx + 1] : '';
        cmdArchive(args[0], { force, reason });
        break;
    case 'publish':
        const dryRun = process.argv.includes('--dry-run');
        cmdPublish({ dryRun });
        break;
    case 'status':
        cmdStatus();
        break;
    case 'adapt':
        if (!args[0]) {
            console.error('Usage: loomkit adapt <tool> (claude-code | codex)');
            process.exit(1);
        }
        cmdAdapt(args[0]);
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
function printHelp() {
    console.log(`
LoomKit — Spec-Driven Design Framework with TDD Superpowers

Usage: loomkit <command> [options]

Commands:
  init                    Scaffold loomkit/ directory
  spec <name>             Create a new change with proposal + spec
  design <name>           Add design.md to existing change
  plan <name>             Add tasks.md to existing change
  verify [name]           Run coverage gate (all changes if no name)
  archive <name>          Archive verified change
  publish [--dry-run]     Publish current version to npm
  status                  Show current changes + coverage
  adapt <tool>            Show adapter instructions (claude-code | codex)
  help                    Show this help
`);
}
//# sourceMappingURL=index.js.map