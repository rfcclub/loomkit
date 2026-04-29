import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function cmdPublish(options: { dryRun?: boolean }): void {
  const pkgPath = join(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version;

  console.log(`📦 ${pkg.name} v${version}`);
  console.log(`  Registry: https://registry.npmjs.org/`);

  if (options.dryRun) {
    // Pack to show what would be published
    try {
      const result = execSync('npm pack --dry-run 2>&1', { encoding: 'utf-8', stdio: 'pipe' });
      console.log(`  Size: ~${(result.match(/package size:? ([\d.]+) kB/) || ['', '?'])[1]} kB`);
    } catch {}

    console.log('\n  🔍 Dry run — not publishing.');
    console.log('  To publish: loomkit publish');
    return;
  }

  console.log('  Publishing...');
  try {
    execSync('npm publish', { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✓  Published v${version}`);
  } catch (e) {
    console.error(`✗  Publish failed: ${e}`);
    process.exit(1);
  }
}
