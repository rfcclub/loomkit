import type { VerifyResult } from '../verify/verify.js';
export interface ForceOptions {
    force: boolean;
    reason: string;
}
export declare function canArchive(verifyResult: VerifyResult | null, forceOptions?: ForceOptions): boolean;
export interface ArchiveMetadata {
    archived_at: string;
    coverage: number;
    forced: boolean;
    reason: string | null;
    spec_count: number;
    requirement_count: number;
    scenario_count: number;
}
export declare function createArchiveMetadata(verifyResult: VerifyResult | null, forceOptions?: ForceOptions, counts?: {
    specs: number;
    requirements: number;
    scenarios: number;
}): ArchiveMetadata;
