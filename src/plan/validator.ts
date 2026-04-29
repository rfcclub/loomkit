export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

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

export function validatePlan(plan: string): PlanValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = plan.match(pattern);
    if (match) {
      errors.push(`placeholder detected: "${match[0]}", replace with actual code`);
    }
  }

  // Check vague instructions
  for (const pattern of VAGUE_PATTERNS) {
    const match = plan.match(pattern);
    if (match) {
      errors.push(`vague instruction: "${match[0]}", show exact code`);
    }
  }

  // Check cross-task references
  for (const pattern of CROSS_REF_PATTERNS) {
    const match = plan.match(pattern);
    if (match) {
      errors.push(`cross-reference detected: "${match[0]}", repeat the code instead`);
    }
  }

  // Check file paths — each task should have Files section
  const taskBlocks = plan.split(/^### Task \d+/m).slice(1);
  for (let i = 0; i < taskBlocks.length; i++) {
    const block = taskBlocks[i];
    if (!block.includes('**Files:**') && !block.includes('**Files:**')) {
      // Check if steps have Create/Modify/Test prefixes
      const hasFilePath = /(?:Create|Modify|Test):\s*`/.test(block);
      if (!hasFilePath) {
        errors.push(`Task ${i + 1}: missing file paths (add **Files:** section)`);
      }
    }
  }

  // Check TDD order — implementation steps should not appear before test steps within a task
  const steps = plan.split(/^-\s*\[[ x]\]\s*\*\*Step\s*\d+:/m).slice(1);
  let lastStepType: 'test' | 'implement' | null = null;
  let currentTask = 0;
  
  // Re-split by task to check per-task TDD order
  const tasks = plan.split(/^### Task/m).slice(1);
  for (const task of tasks) {
    const stepLines = task.match(/^-\s*\[[ x]\]\s*\*\*Step\s*\d+:[^*]+\*\*/gm) || [];
    let foundImplement = false;
    let foundTest = false;
    
    for (const step of stepLines) {
      const lower = step.toLowerCase();
      if (lower.includes('implement') || lower.includes('write minimal')) {
        foundImplement = true;
        if (!foundTest) {
          errors.push(`implementation before test: "${step.replace(/^- \[[ x]\] \*\*/, '').replace(/\*\*$/, '').trim()}" — reorder to write test first`);
        }
      }
      if (lower.includes('failing test') || lower.includes('write the failing test') || lower.includes('write failing test')) {
        foundTest = true;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
