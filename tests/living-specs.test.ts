import { describe, it, expect, beforeEach } from 'vitest';
import { parseDeltaSpec, parseSpec } from '../src/spec/index.js';
import { mergeSpecIntoLiving, bumpVersion, addToChangelog } from '../src/cli/commands/archive.js';

describe('Living Specs', () => {
  const testDir = '/tmp/loomkit-living-specs-test';

  beforeEach(async () => {
    const fs = await import('fs');
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(testDir, { recursive: true });
  });

  it('creates living spec from delta when none exists', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const specsDir = path.join(testDir, 'specs');
    const specFile = path.join(testDir, 'change', 'specs', 'auth', 'spec.md');
    fs.mkdirSync(path.dirname(specFile), { recursive: true });
    
    fs.writeFileSync(specFile, `## ADDED Requirements

### Requirement: User Login
The system SHALL authenticate users.

#### Scenario: Valid credentials
- **WHEN** user submits valid email + password
- **THEN** response.status = 200
`, 'utf-8');

    // changeDir is the parent of specs/ (i.e., the change directory)
    const changeDir = path.join(testDir, 'change');
    await mergeSpecIntoLiving('auth', changeDir, specsDir);

    const livingFile = path.join(specsDir, 'auth', 'spec.md');
    expect(fs.existsSync(livingFile)).toBe(true);
    
    const parsed = parseSpec(fs.readFileSync(livingFile, 'utf-8'));
    expect(parsed.requirements.length).toBe(1);
    expect(parsed.requirements[0].title).toBe('User Login');
  });

  it('merges delta into existing living spec', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const specsDir = path.join(testDir, 'specs');
    // Create existing living spec
    const livingDir = path.join(specsDir, 'auth');
    fs.mkdirSync(livingDir, { recursive: true });
    fs.writeFileSync(path.join(livingDir, 'spec.md'), `# Auth
## Purpose
Auth system.
## Requirements

### Requirement: User Login
The system SHALL authenticate users.

#### Scenario: Valid credentials
- **WHEN** user submits valid credentials
- **THEN** response.status = 200
`, 'utf-8');

    // Create change with ADDED + MODIFIED
    const p = path.join(testDir, 'change2');
    fs.mkdirSync(path.join(p, 'specs', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(p, 'specs', 'auth', 'spec.md'), `## ADDED Requirements

### Requirement: User Logout
The system SHALL invalidate sessions on logout.

#### Scenario: Logout
- **WHEN** user clicks logout
- **THEN** session.token = null

## MODIFIED Requirements

### Requirement: User Login
The system SHALL authenticate users with 2FA support.

#### Scenario: 2FA login
- **WHEN** user has 2FA enabled
- **THEN** response.body.requires_2fa = true
`, 'utf-8');

    await mergeSpecIntoLiving('auth', p, specsDir);

    const livingContent = fs.readFileSync(path.join(specsDir, 'auth', 'spec.md'), 'utf-8');
    const parsed = parseSpec(livingContent);
    
    expect(parsed.requirements.length).toBe(2);
    
    const login = parsed.requirements.find(r => r.title === 'User Login');
    expect(login).toBeDefined();
    expect(login?.description).toContain('2FA');
    // MODIFIED replaces the requirement entirely (including scenarios)
    expect(login?.scenarios.length).toBe(1);
    expect(login?.scenarios[0].id).toContain('2fa');
  });
});

describe('Version Bump', () => {
  it('increments patch version', async () => {
    const fs = await import('fs');
    fs.writeFileSync('/tmp/loomkit-test-pkg.json', JSON.stringify({ version: '1.0.0' }), 'utf-8');
    const newVersion = bumpVersion('/tmp/loomkit-test-pkg.json');
    expect(newVersion).toBe('1.0.1');
    const pkg = JSON.parse(fs.readFileSync('/tmp/loomkit-test-pkg.json', 'utf-8'));
    expect(pkg.version).toBe('1.0.1');
  });

  it('increments from 1.2.9 to 1.2.10', () => {
    const fs = require('fs');
    fs.writeFileSync('/tmp/loomkit-test-pkg2.json', JSON.stringify({ version: '1.2.9' }), 'utf-8');
    const newVersion = bumpVersion('/tmp/loomkit-test-pkg2.json');
    expect(newVersion).toBe('1.2.10');
  });
});
