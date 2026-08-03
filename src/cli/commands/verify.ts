import { join, basename, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getChangeDir, changeExists, listChanges, findChangeSpecFiles } from '../utils.js';
import { parseSpec } from '../../spec/parser.js';
import { calculateCoverage } from '../../tdd/traceability.js';
import { parse as parseYaml } from 'yaml';
import { TransitionGuard } from '../../harness/transition-guard.js';

export function cmdVerify(name?: string, opts: { skip?: boolean } = {}): void {
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

    verifyChange(changeName, opts.skip);
  }
}

function verifyChange(name: string, skip = false): void {
  const changeDir = getChangeDir(name);

  // State machine guard — degrades gracefully when phase.json absent
  try {
    new TransitionGuard(changeDir).canEnter('verify', skip);
  } catch (e) {
    console.error(`✗  ${name}: ${(e as Error).message}`);
    return;
  }

  const specFiles = findChangeSpecFiles(changeDir, name);
  if (specFiles.length === 0) {
    console.log(`\n${name}: ⚠  No spec.md found, skipping`);
    return;
  }

  const mandatoryScenarios: string[] = [];
  const scenarioTestMap: Record<string, string> = {};

  for (const specFile of specFiles) {
    const specContent = readFileSync(specFile, 'utf-8');
    const spec = parseSpec(specContent);
    const capability = basename(dirname(specFile));

    for (const req of spec.requirements) {
      if (req.strength === 'SHALL' || req.strength === 'MUST') {
        for (const sc of req.scenarios) {
          mandatoryScenarios.push(sc.id);
          scenarioTestMap[sc.id] = `tests/${name}/${capability}/${sc.id}.test.ts`;
        }
      }
    }
  }

  const traceFile = join(changeDir, '.traceability.yaml');
  let passingTests: string[] = [];

  if (existsSync(traceFile)) {
    const traceContent = readFileSync(traceFile, 'utf-8');
    try {
      const data: any = parseYaml(traceContent);
      if (data?.scenarios && Array.isArray(data.scenarios)) {
        for (const entry of data.scenarios) {
          if (entry.status === 'passing' && entry.scenario) {
            passingTests.push(entry.scenario);
          }
        }
      }
    } catch (e) {
      console.log(`  ⚠  Could not parse traceability file as YAML: ${e}`);
    }
  }

  const result = calculateCoverage(mandatoryScenarios, passingTests, 100);

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

  const icon = result.passes ? '✓' : '✗';
  console.log(`\n${icon} ${name}`);
  console.log(`  Coverage: ${(result.coverage * 100).toFixed(0)}% (${passingTests.length}/${mandatoryScenarios.length})`);
  if (result.uncovered.length > 0) {
    console.log(`  Uncovered: ${result.uncovered.join(', ')}`);
  }
  console.log(`  Verdict: ${result.passes ? 'PASS' : 'FAIL'}`);
}

export { findChangeSpecFiles };
