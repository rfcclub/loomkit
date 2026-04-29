import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getChangeDir, changeExists, listChanges } from '../utils.js';
import { parseSpec } from '../../spec/parser.js';
import { TraceabilityMap, calculateCoverage } from '../../tdd/traceability.js';
export function cmdVerify(name) {
    const changes = name ? [name] : listChanges();
    if (changes.length === 0) {
        console.log('No changes to verify.');
        return;
    }
    for (const changeName of changes) {
        if (!changeExists(changeName) && name) {
            console.error(`✗  Change "${changeName}" not found.`);
            continue;
        }
        verifyChange(changeName);
    }
}
function verifyChange(name) {
    const changeDir = getChangeDir(name);
    // Read spec
    const specDir = join(changeDir, 'specs', name);
    const specFile = join(specDir, 'spec.md');
    if (!existsSync(specFile)) {
        console.log(`\n${name}: ⚠  No spec.md found, skipping`);
        return;
    }
    const specContent = readFileSync(specFile, 'utf-8');
    const spec = parseSpec(specContent);
    // Collect mandatory scenarios (SHALL/MUST only)
    const mandatoryScenarios = [];
    const scenarioTestMap = {};
    for (const req of spec.requirements) {
        if (req.strength === 'SHALL' || req.strength === 'MUST') {
            for (const sc of req.scenarios) {
                mandatoryScenarios.push(sc.id);
                scenarioTestMap[sc.id] = `tests/${name}/${sc.id}.test.ts`;
            }
        }
    }
    // Check traceability
    const traceFile = join(changeDir, '.traceability.yaml');
    let passingTests = [];
    if (existsSync(traceFile)) {
        const traceContent = readFileSync(traceFile, 'utf-8');
        const tm = new TraceabilityMap();
        // Simple parse
        const lines = traceContent.split('\n');
        for (const line of lines) {
            const mapping = line.match(/^\s+-\s+scenario:\s+(\S+).*\n?$/);
            // rough parse — in prod use yaml package
            if (line.includes('status: passing')) {
                const scenarioLine = lines[lines.indexOf(line) - 1];
                const scMatch = scenarioLine.match(/scenario:\s+(\S+)/);
                if (scMatch)
                    passingTests.push(scMatch[1]);
            }
        }
    }
    // Calculate coverage
    const result = calculateCoverage(mandatoryScenarios, passingTests, 100);
    // Output verify result
    const verifyResult = {
        change: name,
        timestamp: new Date().toISOString(),
        total_scenarios: mandatoryScenarios.length,
        passing: passingTests.length,
        coverage: result.coverage,
        threshold: 100,
        passed: result.passes,
        uncovered: result.uncovered,
    };
    const verifyPath = join(changeDir, '.loomkit-verify.json');
    writeFileSync(verifyPath, JSON.stringify(verifyResult, null, 2), 'utf-8');
    // Print summary
    const icon = result.passes ? '✓' : '✗';
    console.log(`\n${icon} ${name}`);
    console.log(`  Coverage: ${(result.coverage * 100).toFixed(0)}% (${passingTests.length}/${mandatoryScenarios.length})`);
    if (result.uncovered.length > 0) {
        console.log(`  Uncovered: ${result.uncovered.join(', ')}`);
    }
    console.log(`  Verdict: ${result.passes ? 'PASS' : 'FAIL'}`);
}
//# sourceMappingURL=verify.js.map