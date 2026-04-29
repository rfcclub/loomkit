import { parseSpec, type Requirement, type SpecTree } from './parser.js';

export interface DeltaSpec {
  added: Requirement[];
  modified: Requirement[];
  removed: { title: string; reason: string; migration: string }[];
  renamed: { from: string; to: string }[];
}

export function parseDeltaSpec(markdown: string): DeltaSpec {
  const added: Requirement[] = [];
  const modified: Requirement[] = [];
  const removed: DeltaSpec['removed'] = [];
  const renamed: DeltaSpec['renamed'] = [];

  // Split by delta headers
  const sections = markdown.split(/^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements/m);

  for (let i = 1; i < sections.length; i += 2) {
    const sectionType = sections[i];
    const sectionBody = sections[i + 1] || '';

    switch (sectionType) {
      case 'ADDED': {
        const spec = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n${sectionBody}`);
        added.push(...spec.requirements);
        break;
      }
      case 'MODIFIED': {
        const spec = parseSpec(`# T\n## P\nx\n\n## Requirements\n\n${sectionBody}`);
        modified.push(...spec.requirements);
        break;
      }
      case 'REMOVED': {
        const reqRegex = /^###\s+Requirement:\s+(.+)$/gm;
        let match;
        while ((match = reqRegex.exec(sectionBody)) !== null) {
          const title = match[1].trim();
          const after = sectionBody.substring(match.index + match[0].length);
          const reasonMatch = after.match(/\*\*Reason\*\*:\s*(.+)/);
          const migrationMatch = after.match(/\*\*Migration\*\*:\s*(.+)/);
          removed.push({
            title,
            reason: reasonMatch ? reasonMatch[1].trim() : '',
            migration: migrationMatch ? migrationMatch[1].trim() : '',
          });
        }
        break;
      }
      case 'RENAMED': {
        const renameRegex = /^FROM:\s*(.+)\nTO:\s*(.+)$/gm;
        let match;
        while ((match = renameRegex.exec(sectionBody)) !== null) {
          renamed.push({ from: match[1].trim(), to: match[2].trim() });
        }
        break;
      }
    }
  }

  return { added, modified, removed, renamed };
}

export function mergeSpecs(living: SpecTree, delta: DeltaSpec): SpecTree {
  const requirements = [...living.requirements];

  // ADDED: append
  for (const req of delta.added) {
    requirements.push(req);
  }

  // MODIFIED: replace matching
  for (const req of delta.modified) {
    const idx = requirements.findIndex(r => r.title === req.title);
    if (idx !== -1) {
      requirements[idx] = req;
    }
  }

  // REMOVED: remove matching
  for (const rem of delta.removed) {
    const idx = requirements.findIndex(r => r.title === rem.title);
    if (idx !== -1) {
      requirements.splice(idx, 1);
    }
  }

  // RENAMED: rename matching
  for (const ren of delta.renamed) {
    const req = requirements.find(r => r.title === ren.from);
    if (req) {
      req.title = ren.to;
    }
  }

  return { ...living, requirements };
}
