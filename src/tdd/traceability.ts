export interface ScenarioMapping {
  scenario: string;
  test: string;
  status: 'pending' | 'passing' | 'failing';
}

export interface TraceabilityData {
  mappings: ScenarioMapping[];
}

export class TraceabilityMap {
  private mappings: Map<string, ScenarioMapping> = new Map();

  addMapping(scenario: string, test: string): void {
    this.mappings.set(scenario, { scenario, test, status: 'pending' });
  }

  getMapping(scenario: string): ScenarioMapping | undefined {
    return this.mappings.get(scenario);
  }

  updateStatus(scenario: string, status: ScenarioMapping['status']): void {
    const mapping = this.mappings.get(scenario);
    if (mapping) {
      mapping.status = status;
    }
  }

  findUncovered(allScenarios: string[]): string[] {
    return allScenarios.filter(s => !this.mappings.has(s));
  }

  getPassing(): string[] {
    return [...this.mappings.entries()]
      .filter(([, m]) => m.status === 'passing')
      .map(([s]) => s);
  }

  toObject(): TraceabilityData {
    return {
      mappings: [...this.mappings.values()],
    };
  }

  static fromObject(data: TraceabilityData): TraceabilityMap {
    const tm = new TraceabilityMap();
    for (const m of data.mappings) {
      tm.mappings.set(m.scenario, m);
    }
    return tm;
  }
}

export interface CoverageResult {
  coverage: number;
  passes: boolean;
  uncovered: string[];
}

export function calculateCoverage(
  mandatoryScenarios: string[],
  passingScenarios: string[],
  threshold: number,
): CoverageResult {
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
