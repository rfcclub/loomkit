export class TraceabilityMap {
    mappings = new Map();
    addMapping(scenario, test) {
        this.mappings.set(scenario, { scenario, test, status: 'pending' });
    }
    getMapping(scenario) {
        return this.mappings.get(scenario);
    }
    updateStatus(scenario, status) {
        const mapping = this.mappings.get(scenario);
        if (mapping) {
            mapping.status = status;
        }
    }
    findUncovered(allScenarios) {
        return allScenarios.filter(s => !this.mappings.has(s));
    }
    getPassing() {
        return [...this.mappings.entries()]
            .filter(([, m]) => m.status === 'passing')
            .map(([s]) => s);
    }
    toObject() {
        return {
            mappings: [...this.mappings.values()],
        };
    }
    static fromObject(data) {
        const tm = new TraceabilityMap();
        for (const m of data.mappings) {
            tm.mappings.set(m.scenario, m);
        }
        return tm;
    }
}
export function calculateCoverage(mandatoryScenarios, passingScenarios, threshold) {
    if (mandatoryScenarios.length === 0) {
        return { coverage: 1, passes: true, uncovered: [] };
    }
    const passingSet = new Set(passingScenarios);
    const uncovered = mandatoryScenarios.filter(s => !passingSet.has(s));
    const coverage = (mandatoryScenarios.length - uncovered.length) / mandatoryScenarios.length;
    return {
        coverage,
        passes: coverage * 100 >= threshold,
        uncovered,
    };
}
//# sourceMappingURL=traceability.js.map