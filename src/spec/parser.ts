import { parseAssertion } from './assertion.js';

export interface Scenario {
  id: string;
  title: string;
  given: string[];
  when: string[];
  then: { text: string; assertion: ReturnType<typeof parseAssertion> }[];
}

export interface Requirement {
  title: string;
  strength: 'SHALL' | 'MUST' | 'SHOULD' | 'MAY';
  description: string;
  scenarios: Scenario[];
}

export interface SpecTree {
  schemaVersion: number;
  title: string;
  purpose: string;
  requirements: Requirement[];
  warnings: string[];
}

const RFC2119 = ['SHALL', 'MUST', 'SHOULD', 'MAY'] as const;
const MAX_SCHEMA_VERSION = 1;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseSpec(markdown: string): SpecTree {
  const warnings: string[] = [];
  let schemaVersion = 1;

  // Check schema_version line
  const versionMatch = markdown.match(/^schema_version:\s*(\d+)/m);
  if (versionMatch) {
    schemaVersion = parseInt(versionMatch[1], 10);
    if (schemaVersion > MAX_SCHEMA_VERSION) {
      warnings.push(`spec uses schema v${schemaVersion}, LoomKit supports up to v${MAX_SCHEMA_VERSION}`);
    }
  }

  // Extract title
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/\s+Specification$/, '') : '';

  // Extract purpose
  const purposeMatch = markdown.match(/^##\s+Purpose\s*\n([\s\S]*?)(?=\n##\s)/m);
  const purpose = purposeMatch ? purposeMatch[1].trim() : '';

  // Extract requirements
  const requirements: Requirement[] = [];
  const reqRegex = /^###\s+Requirement:\s+(.+)$/gm;
  const scenarioRegex = /^####\s+Scenario:\s+(.+)$/gm;

  // Split by requirement headers
  const parts = markdown.split(/^###\s+Requirement:\s+/m).slice(1);

  for (const part of parts) {
    const firstLine = part.split('\n')[0];
    const reqTitle = firstLine.trim();
    const body = part.split('\n').slice(1).join('\n');

    // Extract description (text before first scenario)
    const descPart = body.split(/^####\s+Scenario:/m)[0].trim();
    const description = descPart;

    // Determine RFC 2119 strength
    let strength: Requirement['strength'] = 'SHALL';
    for (const kw of RFC2119) {
      if (description.includes(kw)) {
        strength = kw;
        break;
      }
    }
    if (!RFC2119.some(kw => description.includes(kw))) {
      warnings.push(`requirement "${reqTitle}" lacks RFC 2119 keyword, treating as SHALL`);
    }

    // Extract scenarios
    const scenarios: Scenario[] = [];
    const scenarioParts = body.split(/^####\s+Scenario:\s+/m).slice(1);

    let scenarioIndex = 0;
    for (const scPart of scenarioParts) {
      const scTitle = scPart.split('\n')[0].trim();
      const scBody = scPart.split('\n').slice(1).join('\n');

      const given: string[] = [];
      const when: string[] = [];
      const then: Scenario['then'] = [];

      const lines = scBody.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();

        // Bold format: - **GIVEN** / - **WHEN** / - **THEN** / - **AND**
        // Plain format: - GIVEN / - WHEN / - THEN / - AND
        if (trimmed.match(/^- \*\*GIVEN\*\*/) || trimmed.match(/^- GIVEN\b/)) {
          const content = trimmed.replace(/^- \*\*GIVEN\*\*\s*/, '').replace(/^- GIVEN\s*/, '');
          given.push(content);
        } else if (trimmed.match(/^- \*\*WHEN\*\*/) || trimmed.match(/^- WHEN\b/)) {
          const content = trimmed.replace(/^- \*\*WHEN\*\*\s*/, '').replace(/^- WHEN\s*/, '');
          when.push(content);
        } else if (trimmed.match(/^- \*\*AND\*\*/) || trimmed.match(/^- AND\b/)) {
          const content = trimmed.replace(/^- \*\*AND\*\*\s*/, '').replace(/^- AND\s*/, '');
          // AND follows GIVEN, WHEN, or THEN (whichever was last)
          if (then.length > 0) {
            then.push({ text: content, assertion: parseAssertion(content) });
          } else if (when.length > 0) {
            when.push(content);
          } else {
            given.push(content);
          }
        } else if (trimmed.match(/^- \*\*THEN\*\*/) || trimmed.match(/^- THEN\b/)) {
          const content = trimmed.replace(/^- \*\*THEN\*\*\s*/, '').replace(/^- THEN\s*/, '');
          then.push({ text: content, assertion: parseAssertion(content) });
        }
      }

      const id = slugify(`${reqTitle} ${scTitle}`);
      scenarios.push({ id, title: scTitle, given, when, then });
      scenarioIndex++;
    }

    requirements.push({ title: reqTitle, strength, description, scenarios });
  }

  return { schemaVersion, title, purpose, requirements, warnings };
}
