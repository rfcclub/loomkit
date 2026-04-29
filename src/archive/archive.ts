import type { VerifyResult } from '../verify/verify.js';

export interface ForceOptions {
  force: boolean;
  reason: string;
}

export function canArchive(
  verifyResult: VerifyResult | null,
  forceOptions?: ForceOptions,
): boolean {
  // Force with reason overrides everything
  if (forceOptions?.force) {
    return forceOptions.reason.trim().length > 0;
  }

  // Normal path: need verify pass
  if (!verifyResult) {
    return false;
  }

  return verifyResult.passed;
}

export interface ArchiveMetadata {
  archived_at: string;
  coverage: number;
  forced: boolean;
  reason: string | null;
  spec_count: number;
  requirement_count: number;
  scenario_count: number;
}

export function createArchiveMetadata(
  verifyResult: VerifyResult | null,
  forceOptions?: ForceOptions,
  counts?: { specs: number; requirements: number; scenarios: number },
): ArchiveMetadata {
  return {
    archived_at: new Date().toISOString(),
    coverage: verifyResult?.coverage ?? 0,
    forced: forceOptions?.force ?? false,
    reason: forceOptions?.force ? (forceOptions.reason || null) : null,
    spec_count: counts?.specs ?? 0,
    requirement_count: counts?.requirements ?? 0,
    scenario_count: counts?.scenarios ?? 0,
  };
}
