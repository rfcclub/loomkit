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
const WorkflowSchemaRaw = z.object({
    name: z.string(),
    version: z.number().int().positive(),
    description: z.string().optional(),
    artifacts: z.array(ArtifactDefSchema).min(1),
    apply: z.array(ApplyRuleSchema).optional(),
});
export function loadSchema(yaml, schemaDir) {
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
        apply: parsed.apply || [],
    };
}
//# sourceMappingURL=loader.js.map