export interface ScenarioMapping {
    scenario: string;
    test: string;
    status: 'pending' | 'passing' | 'failing';
}
export interface TraceabilityData {
    mappings: ScenarioMapping[];
}
export declare class TraceabilityMap {
    private mappings;
    addMapping(scenario: string, test: string): void;
    getMapping(scenario: string): ScenarioMapping | undefined;
    updateStatus(scenario: string, status: ScenarioMapping['status']): void;
    findUncovered(allScenarios: string[]): string[];
    getPassing(): string[];
    toObject(): TraceabilityData;
    static fromObject(data: TraceabilityData): TraceabilityMap;
}
export interface CoverageResult {
    coverage: number;
    passes: boolean;
    uncovered: string[];
}
export declare function calculateCoverage(mandatoryScenarios: string[], passingScenarios: string[], threshold: number): CoverageResult;
