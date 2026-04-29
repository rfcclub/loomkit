export interface VerifyInput {
    mandatoryScenarios: string[];
    passingTests: string[];
    threshold: number;
    scenarioTests?: Record<string, string>;
}
export interface ScenarioStatus {
    scenario: string;
    test: string;
    status: '✓' | '✗';
}
export interface VerifyResult {
    passed: boolean;
    coverage: number;
    threshold: number;
    uncovered: string[];
    scenarioStatus: ScenarioStatus[];
    timestamp: string;
}
export declare function verify(input: VerifyInput): VerifyResult;
