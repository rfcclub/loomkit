export interface PlanValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validatePlan(plan: string): PlanValidationResult;
