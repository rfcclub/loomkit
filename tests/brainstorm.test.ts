import { describe, it, expect } from 'vitest';
import { parseBrainstorm, validateBrainstorm, type BrainstormOutput } from '../src/brainstorm/parser.js';

describe('Brainstorm Parser', () => {
  it('parses problem, constraints, and ideas', () => {
    const markdown = `# Brainstorm: Auth System

## Problem
Users need secure authentication.

## Constraints
- Must work offline
- No third-party auth providers

## Ideas

### Idea 1: JWT with local validation
Offline-friendly. Token contains all claims.

### Idea 2: Device keypair
Generate keypair on device. Sign challenges.

## Questions
- How to handle key rotation?
`;

    const result = parseBrainstorm(markdown);
    expect(result.title).toBe('Auth System');
    expect(result.problem).toContain('secure authentication');
    expect(result.constraints).toHaveLength(2);
    expect(result.ideas).toHaveLength(2);
    expect(result.ideas[0].title).toBe('JWT with local validation');
    expect(result.questions).toHaveLength(1);
  });

  it('generates idea IDs from title', () => {
    const markdown = `# Brainstorm: X\n\n## Problem\nP\n\n## Ideas\n\n### Idea 1: Super Fast Cache\nFast.\n\n### Idea 2: Lazy Loading\nLazy.\n`;
    const result = parseBrainstorm(markdown);
    expect(result.ideas[0].id).toBe('super-fast-cache');
    expect(result.ideas[1].id).toBe('lazy-loading');
  });
});

describe('Brainstorm Validator', () => {
  it('fails without Problem section', () => {
    const markdown = `# Brainstorm: X\n\n## Ideas\n\n### Idea 1: Y\nDesc\n`;
    const result = validateBrainstorm(markdown);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('Problem'));
  });

  it('fails with fewer than 2 ideas', () => {
    const markdown = `# Brainstorm: X\n\n## Problem\nP\n\n## Ideas\n\n### Idea 1: Only One\nDesc\n`;
    const result = validateBrainstorm(markdown);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('2 ideas'));
  });

  it('warns when no Questions section', () => {
    const markdown = `# Brainstorm: X\n\n## Problem\nP\n\n## Ideas\n\n### Idea 1: A\nDesc\n\n### Idea 2: B\nDesc\n`;
    const result = validateBrainstorm(markdown);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContainEqual(expect.stringContaining('Questions'));
  });

  it('passes on valid brainstorm', () => {
    const markdown = `# Brainstorm: X\n\n## Problem\nP\n\n## Constraints\n- C1\n\n## Ideas\n\n### Idea 1: A\nDesc\n\n### Idea 2: B\nDesc\n\n## Questions\n- Q1?\n`;
    const result = validateBrainstorm(markdown);
    expect(result.valid).toBe(true);
  });
});
