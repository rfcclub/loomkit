export function canArchive(verifyResult, forceOptions) {
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
export function createArchiveMetadata(verifyResult, forceOptions, counts) {
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
//# sourceMappingURL=archive.js.map