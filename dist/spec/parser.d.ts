import { parseAssertion } from './assertion.js';
export interface Scenario {
    id: string;
    when: string[];
    then: {
        text: string;
        assertion: ReturnType<typeof parseAssertion>;
    }[];
}
export interface Requirement {
    title: string;
    strength: 'SHALL' | 'MUST' | 'SHOULD' | 'MAY';
    description: string;
    scenarios: Scenario[];
}
export interface SpecTree {
    schemaVersion: number;
    title: string;
    purpose: string;
    requirements: Requirement[];
    warnings: string[];
}
export declare function parseSpec(markdown: string): SpecTree;
