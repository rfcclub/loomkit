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

export function verify(input: VerifyInput): VerifyResult {
  const { mandatoryScenarios, passingTests, threshold, scenarioTests = {} } = input;
  const passingSet = new Set(passingTests);

  const uncovered = mandatoryScenarios.filter(s => !passingSet.has(s));
  const coverage = mandatoryScenarios.length === 0
    ? 1
    : (mandatoryScenarios.length - uncovered.length) / mandatoryScenarios.length;

  const scenarioStatus: ScenarioStatus[] = mandatoryScenarios.map(s => ({
    scenario: s,
    test: scenarioTests[s] || '',
    status: passingSet.has(s) ? '✓' as const : '✗' as const,
  }));

  return {
    passed: coverage * 100 >= threshold,
    coverage,
    threshold,
    uncovered,
    scenarioStatus,
    timestamp: new Date().toISOString(),
  };
}
