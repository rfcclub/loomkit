import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { getChangeDir, changeExists } from '../utils.js';
const DEFAULT_DESIGN = `## Architecture

<!-- Architecture decisions and rationale -->

## Components

<!-- New/modified components -->

## Data Model

<!-- Schema, types, interfaces changes -->

## Test Strategy

| Scenario ID | Test File | Type |
|-------------|-----------|------|
| <!-- id --> | <!-- path --> | unit/integration/e2e |

## Dependencies

<!-- New or updated dependencies -->

## Migration

<!-- Breaking changes, data migration steps -->
`;
export function cmdDesign(name) {
    if (!changeExists(name)) {
        console.error(`✗  Change "${name}" not found. Run "loomkit spec ${name}" first.`);
        process.exit(1);
    }
    const changeDir = getChangeDir(name);
    const designPath = join(changeDir, 'design.md');
    if (existsSync(designPath)) {
        console.error(`✗  Design already exists at ${designPath}`);
        process.exit(1);
    }
    writeFileSync(designPath, DEFAULT_DESIGN, 'utf-8');
    console.log(`✓  Created design.md for "${name}"`);
    console.log(`  ${designPath}`);
    console.log('\n💡  Next: loomkit plan ' + name);
}
//# sourceMappingURL=design.js.map