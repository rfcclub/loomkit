import type { SpecTree, Requirement } from '../spec/parser.js';

export function formatSpec(spec: SpecTree): string {
  const parts: string[] = [];

  if (spec.title) {
    parts.push(`# ${spec.title} Specification`);
    parts.push('');
  }

  if (spec.purpose) {
    parts.push('## Purpose');
    parts.push('');
    parts.push(spec.purpose);
    parts.push('');
  }

  parts.push('## Requirements');
  parts.push('');

  for (const req of spec.requirements) {
    parts.push(`### Requirement: ${req.title}`);
    parts.push('');
    parts.push(req.description);
    parts.push('');

    for (const sc of req.scenarios) {
      parts.push(`#### Scenario: ${sc.id.replace(/^[^-]+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`);
      parts.push('');

      for (const when of sc.when) {
        parts.push(`- **WHEN** ${when}`);
      }
      for (const then of sc.then) {
        parts.push(`- **THEN** ${then.text}`);
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}
