import { join } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { getChangeDir, changeExists, writeFileSafe } from '../utils.js';

export function cmdIntent(name: string): void {
  if (changeExists(name)) {
    console.error(`✗  Change "${name}" already exists at ${getChangeDir(name)}`);
    process.exit(1);
  }

  const changeDir = getChangeDir(name);

  // Create directories
  mkdirSync(changeDir, { recursive: true });

  // Try to copy template, fall back to default
  const template = findIntentTemplate();

  writeFileSafe(join(changeDir, 'intent.md'), template);

  console.log(`✓  Created intent "${name}"`);
  console.log(`  ${changeDir}/`);
  console.log('  └── intent.md');
  console.log('');
  console.log('💡  Next: review and approve the intent, then:');
  console.log(`  loomkit spec ${name}`);
}

function findIntentTemplate(): string {
  // Try schemas in loomkit/ first
  const schemasDir = join(process.cwd(), 'loomkit', 'schemas', 'spec-driven', 'templates');
  const templatePath = join(schemasDir, 'intent.md');
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf-8');
  }

  // Try builtin schemas
  const builtin = join(import.meta.dirname, '..', '..', '..', 'schemas', 'spec-driven', 'templates', 'intent.md');
  try {
    if (existsSync(builtin)) {
      return readFileSync(builtin, 'utf-8');
    }
  } catch {}

  // Return default (shouldn't reach here if template is bundled)
  return `# Intent: ${name}

## Raw Request

<!-- Original user request, verbatim -->

## Problem

<!-- The actual problem to solve. -->

## Desired Outcome

<!-- The observable outcome that should be true after this change. -->

## Users / Actors

- <!-- Primary user -->

## Current Context

<!-- Relevant existing system behavior, files, modules, constraints. -->

## Proposed Direction

<!-- Likely solution direction, but not yet binding spec. -->

## Scope

- <!-- Included -->

## Non-Goals

- <!-- Explicitly excluded -->

## Constraints

- <!-- Constraints -->

## Success Criteria

- <!-- Measurable condition -->

## Risks

- <!-- Risk -->

## Ambiguities

### Blocking

- <!-- Must resolve before spec/design -->

### Non-Blocking

- <!-- Can proceed with assumption -->

## Assumptions

- <!-- Assumption -->

## Spec Seeds

- <!-- Candidate requirement -->

## Intent Approval

Status: DRAFT

Approved by:
Date:
`;
}
