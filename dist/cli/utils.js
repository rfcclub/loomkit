import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
export function getProjectRoot() {
    const cwd = process.cwd();
    const loomkitDir = join(cwd, 'loomkit');
    if (existsSync(loomkitDir) && statSync(loomkitDir).isDirectory()) {
        return cwd;
    }
    let dir = cwd;
    while (dir !== '/') {
        if (existsSync(join(dir, 'loomkit')) && statSync(join(dir, 'loomkit')).isDirectory()) {
            return dir;
        }
        dir = dirname(dir);
    }
    return cwd;
}
export function getLoomKitDir() {
    return join(getProjectRoot(), 'loomkit');
}
export function getChangesDir() {
    return join(getLoomKitDir(), 'changes');
}
export function getChangeDir(name) {
    return join(getChangesDir(), name);
}
export function getSpecsDir() {
    return join(getLoomKitDir(), 'specs');
}
export function getSchemasDir() {
    return join(getLoomKitDir(), 'schemas');
}
export function getPackageRoot() {
    return dirname(dirname(dirname(fileURLToPath(import.meta.url))));
}
export function getBuiltinSchemasDir() {
    return join(getPackageRoot(), 'schemas', 'spec-driven');
}
export function readConfig() {
    const configPath = join(getLoomKitDir(), 'config.yaml');
    if (!existsSync(configPath)) {
        return {};
    }
    const content = readFileSync(configPath, 'utf-8');
    return parseYamlSimple(content);
}
export function parseYamlSimple(yaml) {
    const result = {};
    let currentSection = null;
    for (const line of yaml.split('\n')) {
        const trimmed = line.trimEnd();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const sectionMatch = trimmed.match(/^(\w+):\s*$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            if (!result[currentSection])
                result[currentSection] = {};
            continue;
        }
        if (currentSection && trimmed.startsWith('  ')) {
            const kvMatch = trimmed.trim().match(/^(\w+):\s*(.+)$/);
            if (kvMatch) {
                let value = kvMatch[2].trim();
                if (/^\d+$/.test(value))
                    value = parseInt(value, 10);
                if (value === 'true')
                    value = true;
                if (value === 'false')
                    value = false;
                result[currentSection][kvMatch[1]] = value;
            }
            continue;
        }
        if (currentSection && trimmed.startsWith('    - ')) {
            const arr = result[currentSection];
            const lastKey = Object.keys(arr).pop();
            if (lastKey && Array.isArray(arr[lastKey])) {
                arr[lastKey].push(trimmed.trim().replace(/^- /, ''));
            }
            continue;
        }
        const topMatch = trimmed.match(/^(\w+):\s*(.+)$/);
        if (topMatch) {
            result[topMatch[1]] = topMatch[2].trim();
        }
    }
    return result;
}
export function changeExists(name) {
    return existsSync(getChangeDir(name));
}
export function listChanges() {
    const dir = getChangesDir();
    if (!existsSync(dir))
        return [];
    return readdirSync(dir).filter(f => statSync(join(dir, f)).isDirectory() && !f.startsWith('.'));
}
export function copyDir(src, dest) {
    const entries = readdirSync(src, { withFileTypes: true });
    mkdirSync(dest, { recursive: true });
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else {
            mkdirSync(dirname(destPath), { recursive: true });
            if (existsSync(destPath))
                continue;
            writeFileSync(destPath, readFileSync(srcPath, 'utf-8'));
        }
    }
}
export function writeFileSafe(path, content) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, 'utf-8');
}
//# sourceMappingURL=utils.js.map