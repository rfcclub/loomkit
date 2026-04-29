export function verify(input) {
    const { mandatoryScenarios, passingTests, threshold, scenarioTests = {} } = input;
    const passingSet = new Set(passingTests);
    const uncovered = mandatoryScenarios.filter(s => !passingSet.has(s));
    const coverage = mandatoryScenarios.length === 0
        ? 1
        : (mandatoryScenarios.length - uncovered.length) / mandatoryScenarios.length;
    const scenarioStatus = mandatoryScenarios.map(s => ({
        scenario: s,
        test: scenarioTests[s] || '',
        status: passingSet.has(s) ? '✓' : '✗',
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
//# sourceMappingURL=verify.js.map