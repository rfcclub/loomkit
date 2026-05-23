import { z } from 'zod';
import { parse as parseYaml } from 'yaml';

const ArtifactDefSchema = z.object({
  id: z.string(),
  generates: z.string(),
  description: z.string(),
  template: z.string().optional(),
  instruction: z.string().optional(),
});

const ApplyRuleSchema = z.object({
  from: z.string(),
  to: z.string(),
});

const ApplyPhaseSchema = z.object({
  requires: z.array(z.string()).min(1),
  tracks: z.string().nullable().optional(),
  instruction: z.string().optional(),
});

const WorkflowSchemaRaw = z.object({
  name: z.string(),
  version: z.number().int().positive(),
  description: z.string().optional(),
  artifacts: z.array(ArtifactDefSchema).min(1),
  apply: z.union([z.array(ApplyRuleSchema), ApplyPhaseSchema]).optional(),
});

export type ArtifactDef = z.infer<typeof ArtifactDefSchema>;
export type ApplyRule = z.infer<typeof ApplyRuleSchema>;
export type ApplyPhase = z.infer<typeof ApplyPhaseSchema>;

export interface WorkflowSchema {
  name: string;
  version: number;
  description: string;
  artifacts: (ArtifactDef & { templatePath?: string })[];
  apply?: ApplyRule[] | ApplyPhase;
}

export function loadSchema(yaml: string, schemaDir?: string): WorkflowSchema {
  const parsed = WorkflowSchemaRaw.parse(parseYaml(yaml));

  // Check duplicate artifact ids
  const ids = parsed.artifacts.map(a => a.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    throw new Error(`duplicate artifact ids: ${dupes.join(', ')}`);
  }

  const dir = schemaDir || '.';
  return {
    ...parsed,
    description: parsed.description || '',
    artifacts: parsed.artifacts.map(a => ({
      ...a,
      templatePath: a.template ? `${dir}/templates/${a.template}` : undefined,
    })),
    apply: parsed.apply,
  };
}
