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
