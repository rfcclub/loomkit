import { z } from 'zod';
declare const ArtifactDefSchema: z.ZodObject<{
    id: z.ZodString;
    generates: z.ZodString;
    description: z.ZodString;
    template: z.ZodOptional<z.ZodString>;
    instruction: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ArtifactDef = z.infer<typeof ArtifactDefSchema>;
export interface WorkflowSchema {
    name: string;
    version: number;
    description: string;
    artifacts: (ArtifactDef & {
        templatePath?: string;
    })[];
    apply: {
        from: string;
        to: string;
    }[];
}
export declare function loadSchema(yaml: string, schemaDir?: string): WorkflowSchema;
export {};
