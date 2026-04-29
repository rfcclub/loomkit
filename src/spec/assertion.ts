export interface Assertion {
  target: string;
  operator: string;
  expected: string;
}

export function parseAssertion(text: string): Assertion {
  const trimmed = text.trim();

  // Order matters: check longer operators first
  const operators = ['!=', '>=', '<=', 'matches', 'contains', 'is a', '>', '<', '='];

  for (const op of operators) {
    const idx = trimmed.indexOf(op);
    if (idx === -1) continue;

    // Make sure it's not a false match (e.g., "is" inside "is a")
    if (op === 'is a' && !trimmed.includes(' is a ')) continue;
    if (op === 'matches' && !trimmed.includes(' matches ')) continue;
    if (op === 'contains' && !trimmed.includes(' contains ')) continue;

    const target = trimmed.substring(0, idx).trim();
    let expected = trimmed.substring(idx + op.length).trim();

    // For matches, strip the regex delimiters
    if (op === 'matches' && expected.startsWith('/')) {
      expected = expected.replace(/^\/(.*?)\/$/, '$1');
    }

    return { target, operator: op, expected };
  }

  return { target: trimmed, operator: '=', expected: 'true' };
}
