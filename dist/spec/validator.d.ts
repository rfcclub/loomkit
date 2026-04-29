export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateSpec(markdown: string): ValidationResult;
