export interface BrainstormIdea {
    id: string;
    title: string;
    description: string;
}
export interface BrainstormOutput {
    title: string;
    problem: string;
    constraints: string[];
    ideas: BrainstormIdea[];
    questions: string[];
}
export interface BrainstormValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function parseBrainstorm(markdown: string): BrainstormOutput;
export declare function validateBrainstorm(markdown: string): BrainstormValidation;
