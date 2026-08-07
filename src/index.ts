export { parseSpec, validateSpec, parseAssertion, parseDeltaSpec, mergeSpecs } from './spec/index.js';
export type { SpecTree, Requirement, Scenario, Assertion, DeltaSpec, ValidationResult } from './spec/index.js';

export { validatePlan } from './plan/validator.js';

export { loadConfig } from './config/loader.js';
export type { LoomKitConfig } from './config/loader.js';

export { TraceabilityMap, calculateCoverage } from './tdd/traceability.js';
export type { ScenarioMapping, CoverageResult } from './tdd/traceability.js';

export { verify } from './verify/verify.js';
export type { VerifyInput, VerifyResult } from './verify/verify.js';

export { canArchive, createArchiveMetadata } from './archive/archive.js';
export type { ArchiveMetadata, ForceOptions } from './archive/archive.js';

export { parseBrainstorm, validateBrainstorm } from './brainstorm/parser.js';
export type { BrainstormOutput, BrainstormValidation } from './brainstorm/parser.js';

export { loadSchema } from './schema/loader.js';
export type { WorkflowSchema, ArtifactDef } from './schema/loader.js';

// Harness — plan.json (weak-model task list) read access for external consumers
// (e.g. pilotfish), so they read the same file loomkit itself writes rather than
// re-parsing plan.json independently.
export { readPlanJson, findProducerTask } from './harness/plan-json.js';
export type {
  PlanJson,
  PlanTask,
  PlanTraceRef,
  PlanEscalation,
  TaskArtifact,
  TaskStatus,
  DebugRef,
  DebugRefCost,
} from './harness/types.js';
