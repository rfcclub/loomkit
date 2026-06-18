import { join } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { getChangeDir, getChangesDir, changeExists, listChanges } from '../utils.js';

export function cmdShow(name?: string): void {
  // No name — list all changes
  if (!name) {
    const changes = listChanges();
    if (changes.length === 0) {
      console.log('No active changes.');
      return;
    }
    console.log('Active changes:');
    console.log('');
    for (const change of changes) {
      const changeDir = getChangeDir(change);
      const hasIntent = existsSync(join(changeDir, 'intent.md'));
      const hasProposal = existsSync(join(changeDir, 'proposal.md'));
      const hasDesign = existsSync(join(changeDir, 'design.md'));
      const hasTasks = existsSync(join(changeDir, 'tasks.md'));
      const hasVerify = existsSync(join(changeDir, '.loomkit-verify.json'));

      const flags = [
        hasIntent ? 'I' : '-',
        hasProposal ? 'P' : '-',
        hasDesign ? 'D' : '-',
        hasTasks ? 'T' : '-',
        hasVerify ? 'V' : '-',
      ].join('');

      console.log(`  [${flags}] ${change}`);
    }
    console.log('');
    console.log('  I=intent  P=proposal  D=design  T=tasks  V=verified');
    console.log('');
    console.log('Usage: loomkit show <name>');
    return;
  }

  // Named change — show details
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`);
    console.error('   Run: loomkit show');
    process.exit(1);
  }

  const changeDir = getChangeDir(name);

  // List all files in change directory
  console.log(`Change: ${name}`);
  console.log(`Path: ${changeDir}`);
  console.log('');

  const files = listAllFiles(changeDir);
  for (const file of files) {
    const rel = file.replace(changeDir + '/', '');
    const size = statSync(file).size;
    console.log(`  ${rel} (${formatSize(size)})`);
  }

  console.log('');

  // Show intent summary if present
  const intentPath = join(changeDir, 'intent.md');
  if (existsSync(intentPath)) {
    const intent = readFileSync(intentPath, 'utf-8');
    const status = extractField(intent, 'Status:', 'DRAFT');
    const problem = extractSection(intent, '## Problem');
    const outcome = extractSection(intent, '## Desired Outcome');
    console.log('Intent:');
    if (problem) console.log(`  Problem: ${truncate(problem)}`);
    if (outcome) console.log(`  Outcome: ${truncate(outcome)}`);
    console.log(`  Status: ${status}`);
    console.log('');
  }

  // Show proposal summary
  const proposalPath = join(changeDir, 'proposal.md');
  if (existsSync(proposalPath)) {
    const proposal = readFileSync(proposalPath, 'utf-8');
    const why = extractSection(proposal, '## Why');
    if (why) console.log(`Proposal: ${truncate(why)}`);
    console.log('');
  }

  // Show verify status
  const verifyPath = join(changeDir, '.loomkit-verify.json');
  if (existsSync(verifyPath)) {
    const verify = JSON.parse(readFileSync(verifyPath, 'utf-8'));
    const passed = verify.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`Verify: ${passed} (coverage: ${verify.coverage ?? 'N/A'}%)`);
    if (verify.failures?.length) {
      for (const f of verify.failures) {
        console.log(`  - ${f}`);
      }
    }
    console.log('');
  }
}

function listAllFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name.startsWith('.')) continue; // skip hidden
    if (entry.isDirectory()) {
      results.push(...listAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function extractSection(content: string, header: string): string | null {
  const idx = content.indexOf(header);
  if (idx === -1) return null;
  const after = content.substring(idx + header.length);
  const nextHeader = after.match(/^##?\s/);
  const end = nextHeader ? after.indexOf(nextHeader[0]) : after.length;
  return after.substring(0, end > 0 ? end : after.length).trim().replace(/\n/g, ' ') || null;
}

function extractField(content: string, field: string, fallback: string): string {
  const match = content.match(new RegExp(`${field}\\s*(.+)`, 'i'));
  return match ? match[1].trim() : fallback;
}

function truncate(text: string, max = 120): string {
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
