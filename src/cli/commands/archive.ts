import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { getChangeDir, getSpecsDir, changeExists } from '../utils.js';
import { parseDeltaSpec, parseSpec, mergeSpecs } from '../../spec/index.js';
import { formatSpec } from '../../spec/format.js';

export function cmdArchive(name: string, options: { force?: boolean; reason?: string }): void {
  if (!changeExists(name)) {
    console.error(`✗  Change "${name}" not found.`);
    process.exit(1);
  }

  const changeDir = getChangeDir(name);

  // Check verify result
  const verifyPath = join(changeDir, '.loomkit-verify.json');
  if (!existsSync(verifyPath) && !options.force) {
    console.error(`✗  No verify result for "${name}". Run "loomkit verify ${name}" first, or use --force.`);
    process.exit(1);
  }

  let verified = false;
  if (existsSync(verifyPath)) {
    const verifyResult = JSON.parse(readFileSync(verifyPath, 'utf-8'));
    verified = verifyResult.passed;
  }

  if (!verified && !options.force) {
    console.error(`✗  Verify failed for "${name}". Fix issues or use --force --reason="..."`);
    process.exit(1);
  }

  if (options.force && (!options.reason || options.reason.trim() === '')) {
    console.error('✗  Force archive requires --reason. Usage: --force --reason="hotfix"');
    process.exit(1);
  }

  // Step 1: Merge spec into living specs
  const specsDir = getSpecsDir();
  mergeSpecIntoLiving(name, changeDir, specsDir);

  // Step 2: Bump version
  const pkgPath = join(getChangeDir(name), '..', '..', '..', 'package.json');
  let newVersion: string | null = null;
  if (existsSync(pkgPath)) {
    try {
      newVersion = bumpVersion(pkgPath);
      console.log(`  Version: ${newVersion}`);
    } catch (e) {
      console.log(`  ⚠  Version bump skipped: ${e}`);
    }
  }

  // Step 3: Move change dir to archive/
  const archiveDir = join(specsDir, '..', 'archive');
  mkdirSync(archiveDir, { recursive: true });

  const archivePath = join(archiveDir, `${name}-${Date.now()}`);
  renameSync(changeDir, archivePath);

  // Write metadata
  const metaPath = join(archivePath, '.archive-meta.json');
  const metadata = {
    change: name,
    archived_at: new Date().toISOString(),
    forced: !!options.force,
    reason: options.reason || null,
    verified,
    version: newVersion,
  };
  writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

  console.log(`✓  Archived "${name}"`);
  console.log(`  ${archivePath}`);
  if (options.force) {
    console.log(`  ⚠  Forced archive (reason: ${options.reason})`);
  }
  if (newVersion) {
    console.log(`  🏷  Tagged v${newVersion}`);
  }
}

export async function mergeSpecIntoLiving(
  name: string,
  changeDir: string,
  specsDir: string,
): Promise<void> {
  const specFile = join(changeDir, 'specs', name, 'spec.md');
  if (!existsSync(specFile)) return;

  const deltaContent = readFileSync(specFile, 'utf-8');
  const delta = parseDeltaSpec(deltaContent);

  const livingSpecDir = join(specsDir, name);
  mkdirSync(livingSpecDir, { recursive: true });
  const livingSpecFile = join(livingSpecDir, 'spec.md');

  let living;
  if (existsSync(livingSpecFile)) {
    living = parseSpec(readFileSync(livingSpecFile, 'utf-8'));
  } else {
    living = { title: name, purpose: '', requirements: [], warnings: [], schemaVersion: 1 };
  }

  const merged = mergeSpecs(living, delta);
  const md = formatSpec(merged);
  writeFileSync(livingSpecFile, md, 'utf-8');

  console.log(`  📋 Updated living spec: ${livingSpecFile}`);
}

export function bumpVersion(pkgPath: string): string {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const parts = pkg.version.split('.').map(Number);
  parts[2] += 1;
  const newVersion = parts.join('.');
  pkg.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  return newVersion;
}
