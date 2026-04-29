import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { getChangeDir, getSpecsDir, changeExists } from '../utils.js';
export function cmdArchive(name, options) {
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
    // Archive: move change dir to archive/
    const archiveDir = join(getSpecsDir(), '..', 'archive');
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
    };
    writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`✓  Archived "${name}"`);
    console.log(`  ${archivePath}`);
    if (options.force) {
        console.log(`  ⚠  Forced archive (reason: ${options.reason})`);
    }
}
//# sourceMappingURL=archive.js.map