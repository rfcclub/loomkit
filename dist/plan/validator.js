const PLACEHOLDER_PATTERNS = [
    /\bTBD\b/i,
    /\bTODO\b/i,
    /\bimplement later\b/i,
    /\bfill in\b/i,
    /\bfill in details\b/i,
];
const CROSS_REF_PATTERNS = [
    /similar to Task \d+/i,
    /same as Task \d+/i,
    /same pattern as/i,
    /same approach as/i,
    /same as above/i,
];
const VAGUE_PATTERNS = [
    /add (appropriate|proper|suitable) error handling/i,
    /handle edge cases/i,
    /add validation/i,
    /add appropriate/i,
];
export function validatePlan(plan) {
    const errors = [];
    const warnings = [];
    // 1. Check Superpowers Sub-Skill Header Block
    const hasSuperpowersHeader = plan.includes('REQUIRED SUB-SKILL') &&
        (plan.includes('superpowers:subagent-driven-development') || plan.includes('superpowers:executing-plans'));
    if (!hasSuperpowersHeader) {
        errors.push('Superpowers compliance failure: Plan must start with the REQUIRED SUB-SKILL header block specifying superpowers:subagent-driven-development or superpowers:executing-plans.');
    }
    // 2. Check placeholders
    for (const pattern of PLACEHOLDER_PATTERNS) {
        const match = plan.match(pattern);
        if (match) {
            errors.push(`placeholder detected: "${match[0]}", replace with actual code`);
        }
    }
    // 3. Check vague instructions
    for (const pattern of VAGUE_PATTERNS) {
        const match = plan.match(pattern);
        if (match) {
            errors.push(`vague instruction: "${match[0]}", show exact code`);
        }
    }
    // 4. Check cross-task references
    for (const pattern of CROSS_REF_PATTERNS) {
        const match = plan.match(pattern);
        if (match) {
            errors.push(`cross-reference detected: "${match[0]}", repeat the code instead`);
        }
    }
    // 5. Check task-level structure and TDD order
    const taskBlocks = plan.split(/^### Task \d+/m).slice(1);
    if (taskBlocks.length === 0) {
        warnings.push('Plan contains no task blocks (use "### Task N" format).');
    }
    for (let i = 0; i < taskBlocks.length; i++) {
        const block = taskBlocks[i];
        const taskNum = i + 1;
        // Check files section
        const hasFilesHeader = block.includes('**Files:**');
        const hasFilePath = /(?:Create|Modify|Test):\s*`/.test(block);
        if (!hasFilesHeader && !hasFilePath) {
            errors.push(`Task ${taskNum}: missing file paths (add **Files:** section with Create/Modify/Test paths)`);
        }
        // Check checkboxes for steps
        const stepLines = block.match(/^-\s*\[[ x]\]\s*\*\*Step\s*\d+:[^*]+\*\*/gm) || [];
        if (stepLines.length === 0) {
            errors.push(`Task ${taskNum}: has no checkboxes (each step must use "- [ ] **Step N: ...**" syntax)`);
            continue;
        }
        // Check TDD sequence: test, implement, commit
        let foundTest = false;
        let foundImplement = false;
        let foundCommit = false;
        for (const step of stepLines) {
            const lower = step.toLowerCase();
            if (lower.includes('test') || lower.includes('failing test')) {
                foundTest = true;
            }
            if (lower.includes('implement') || lower.includes('write minimal') || lower.includes('write minimal implementation')) {
                foundImplement = true;
                if (!foundTest) {
                    errors.push(`Task ${taskNum}: TDD violation - implementation before test step: "${step.replace(/^- \[[ x]\] \*\*/, '').replace(/\*\*$/, '').trim()}" — reorder to write test first`);
                }
            }
            if (lower.includes('commit') || lower.includes('git commit')) {
                foundCommit = true;
            }
        }
        if (!foundTest) {
            errors.push(`Task ${taskNum}: missing failing test step (TDD RED cycle)`);
        }
        if (!foundImplement) {
            errors.push(`Task ${taskNum}: missing minimal implementation step (TDD GREEN cycle)`);
        }
        if (!foundCommit) {
            errors.push(`Task ${taskNum}: missing commit step (every task must end with a commit step)`);
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
//# sourceMappingURL=validator.js.map