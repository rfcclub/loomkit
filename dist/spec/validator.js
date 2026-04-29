import { parseSpec } from './parser.js';
export function validateSpec(markdown) {
    const errors = [];
    const warnings = [];
    // Check Purpose section
    if (!markdown.includes('## Purpose')) {
        errors.push('spec missing required section: Purpose');
    }
    // Check for OR in scenarios
    const orMatch = markdown.match(/^- \*\*(WHEN|THEN)\*\*.*\bOR\b/gm);
    if (orMatch) {
        errors.push('OR not supported in scenarios, split into separate scenarios');
    }
    // Parse to check deeper
    const spec = parseSpec(markdown);
    warnings.push(...spec.warnings);
    // Check each scenario has THEN
    for (const req of spec.requirements) {
        for (const scenario of req.scenarios) {
            if (scenario.then.length === 0) {
                errors.push(`scenario "${scenario.id}" missing THEN clause`);
            }
        }
    }
    // Check schema version
    if (spec.schemaVersion > 1) {
        warnings.push(`spec uses schema v${spec.schemaVersion}, LoomKit supports up to v1`);
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
//# sourceMappingURL=validator.js.map