import { z } from 'zod';
declare const LoomKitConfigSchema: z.ZodObject<{
    schema: z.ZodDefault<z.ZodEnum<{
        "spec-driven": "spec-driven";
    }>>;
    tdd: z.ZodOptional<z.ZodObject<{
        framework: z.ZodDefault<z.ZodEnum<{
            custom: "custom";
            vitest: "vitest";
            jest: "jest";
            pytest: "pytest";
            xunit: "xunit";
        }>>;
        enforce: z.ZodDefault<z.ZodBoolean>;
        coverageThreshold: z.ZodDefault<z.ZodNumber>;
        command: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    context: z.ZodDefault<z.ZodString>;
    rules: z.ZodDefault<z.ZodRecord<z.core.$ZodRecordKey, z.core.SomeType>>;
}, z.core.$strip>;
export type LoomKitConfig = z.infer<typeof LoomKitConfigSchema>;
export declare function loadConfig(yamlContent: string | null): LoomKitConfig;
export {};
