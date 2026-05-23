import { z } from 'zod';
declare const ArtifactDefSchema: z.ZodObject<{
    id: z.ZodString;
    generates: z.ZodString;
    description: z.ZodString;
    template: z.ZodOptional<z.ZodString>;
    instruction: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ApplyRuleSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strip>;
declare const ApplyPhaseSchema: z.ZodObject<{
    requires: z.ZodArray<z.ZodString>;
    tracks: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    instruction: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ArtifactDef = z.infer<typeof ArtifactDefSchema>;
export type ApplyRule = z.infer<typeof ApplyRuleSchema>;
export type ApplyPhase = z.infer<typeof ApplyPhaseSchema>;
export interface WorkflowSchema {
    name: string;
    version: number;
    description: string;
    artifacts: (ArtifactDef & {
        templatePath?: string;
    })[];
    apply?: ApplyRule[] | ApplyPhase;
}
export declare function loadSchema(yaml: string, schemaDir?: string): WorkflowSchema;
export {};
