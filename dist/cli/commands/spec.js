import { join } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { getChangeDir, changeExists, writeFileSafe, readConfig } from '../utils.js';
const DEFAULT_PROPOSAL = `## Why

<!-- What problem does this solve? Why now? -->

## What Changes

<!-- List of changes -->

## Capabilities

### New Capabilities
- \`${0}\`: <brief description>

### Modified Capabilities
<!-- None -->

## Impact

<!-- Affected code, APIs, dependencies, systems -->
`;
const DEFAULT_SPEC = `## ADDED Requirements

### Requirement: <!-- name -->
<!-- description using SHALL/MUST/SHOULD -->

#### Scenario: <!-- scenario name -->
- **WHEN** <!-- condition -->
- **THEN** <!-- expected outcome -->

## MODIFIED Requirements

<!-- None -->

## REMOVED Requirements

<!-- None -->

## RENAMED Requirements

<!-- None -->
`;
export function cmdSpec(name) {
    // Allow spec to add to an intent-only directory
    if (changeExists(name)) {
        const changeDir = getChangeDir(name);
        const intentPath = join(changeDir, 'intent.md');
        const proposalPath = join(changeDir, 'proposal.md');
        const hasOnlyIntent = existsSync(intentPath) && !existsSync(proposalPath);
        if (!hasOnlyIntent) {
            console.error(`✗  Change "${name}" already exists at ${getChangeDir(name)}`);
            process.exit(1);
        }
        // Intent-only directory — proceed to add proposal + spec
        addSpecFiles(changeDir, name);
        return;
    }
    const changeDir = getChangeDir(name);
    // Intent gate: check if intent.md exists
    const intentPath = join(changeDir, 'intent.md');
    const intentMissing = !existsSync(intentPath);
    if (intentMissing) {
        const config = readConfig();
        const enforceIntent = config?.intent?.enforce === true;
        if (enforceIntent) {
            console.error(`✗  Intent gate: No intent.md found for "${name}".`);
            console.error(`   Run: loomkit intent ${name}`);
            console.error('   Or set intent.enforce: false in loomkit/config.yaml to skip.');
            process.exit(1);
        }
        else {
            console.warn('⚠  Intent gate: No intent.md found. Spec may lack intent traceability.');
            console.warn(`   Run: loomkit intent ${name}`);
            console.warn('');
        }
    }
    addSpecFiles(changeDir, name);
}
function addSpecFiles(changeDir, name) {
    const specsDir = join(changeDir, 'specs', name);
    // Create directories
    mkdirSync(specsDir, { recursive: true });
    // Try to copy template, fall back to default
    const proposalTemplate = findTemplate('proposal.md');
    const specTemplate = findTemplate('spec.md');
    writeFileSafe(join(changeDir, 'proposal.md'), proposalTemplate);
    writeFileSafe(join(specsDir, 'spec.md'), specTemplate);
    console.log(`✓  Created change "${name}"`);
    console.log(`  ${changeDir}/`);
    console.log('  ├── proposal.md');
    console.log(`  └── specs/${name}/spec.md`);
    console.log('\n💡  Next: edit the proposal and spec, then:');
    console.log(`  loomkit design ${name}`);
    console.log(`  loomkit plan ${name}`);
}
function findTemplate(name) {
    // Try schemas in workspace subdirectories (loomkit/ or openspec/)
    for (const wsName of ['loomkit', 'openspec']) {
        const schemasDir = join(process.cwd(), wsName, 'schemas', 'spec-driven', 'templates');
        const templatePath = join(schemasDir, name);
        if (existsSync(templatePath)) {
            return readFileSync(templatePath, 'utf-8');
        }
    }
    // Try builtin schemas
    const builtin = join(import.meta.dirname, '..', '..', '..', 'schemas', 'spec-driven', 'templates', name);
    try {
        if (existsSync(builtin)) {
            return readFileSync(builtin, 'utf-8');
        }
    }
    catch { }
    // Return default
    return name === 'proposal.md'
        ? DEFAULT_PROPOSAL
        : DEFAULT_SPEC;
}
//# sourceMappingURL=spec.js.map