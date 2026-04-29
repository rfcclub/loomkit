import { z } from 'zod';
const TddConfigSchema = z.object({
    framework: z.enum(['vitest', 'jest', 'pytest', 'xunit', 'custom']).default('vitest'),
    enforce: z.boolean().default(true),
    coverageThreshold: z.number().int().min(0).max(100).default(100),
    command: z.string().optional(),
});
const LoomKitConfigSchema = z.object({
    schema: z.enum(['spec-driven']).default('spec-driven'),
    tdd: TddConfigSchema.optional(),
    context: z.string().default(''),
    rules: z.record(z.array(z.string())).default({}),
});
function substituteEnvVars(value) {
    return value.replace(/\$\{(\w+)\}/g, (_, varName) => {
        const val = process.env[varName];
        if (val === undefined) {
            throw new Error(`environment variable ${varName} not set`);
        }
        return val;
    });
}
export function loadConfig(yamlContent) {
    if (!yamlContent) {
        return LoomKitConfigSchema.parse({ tdd: TddConfigSchema.parse({}) });
    }
    // Simple YAML parsing for flat structure
    // For production, use 'yaml' package — this handles basic key:value + nested tdd:
    const raw = {};
    let currentSection = null;
    for (const line of yamlContent.split('\n')) {
        const trimmed = line.trimEnd();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        // Subst env vars
        const processed = substituteEnvVars(trimmed);
        // Nested section (tdd:)
        const sectionMatch = processed.match(/^(\w+):\s*$/);
        if (sectionMatch) {
            currentSection = sectionMatch[1];
            if (!raw[currentSection])
                raw[currentSection] = {};
            continue;
        }
        // Key-value in nested section
        if (currentSection && processed.startsWith('  ')) {
            const kvMatch = processed.trim().match(/^(\w+):\s*(.+)$/);
            if (kvMatch) {
                let value = kvMatch[2].trim();
                // Try to parse as number
                if (/^\d+$/.test(value))
                    value = parseInt(value, 10);
                // Try to parse as boolean
                if (value === 'true')
                    value = true;
                if (value === 'false')
                    value = false;
                raw[currentSection][kvMatch[1]] = value;
            }
            continue;
        }
        // Top-level key-value
        const topMatch = processed.match(/^(\w+):\s*(.+)$/);
        if (topMatch) {
            raw[topMatch[1]] = topMatch[2].trim();
        }
    }
    // Convert snake_case to camelCase for tdd fields
    if (raw.tdd) {
        const tdd = raw.tdd;
        if ('coverage_threshold' in tdd) {
            tdd.coverageThreshold = tdd.coverage_threshold;
            delete tdd.coverage_threshold;
        }
    }
    return LoomKitConfigSchema.parse(raw);
}
//# sourceMappingURL=loader.js.map