# Design: Verify & Archive

## Approach
Verify = read-only check (traceability + test framework). Archive = file operation gated by verify status. Spec merge uses OpenSpec's delta operations from spec-format change.

## Data Flow
```
/lk:verify
  1. Read .traceability.yaml → scenario→test mappings
  2. Read spec scenarios → all mandatory scenarios
  3. Diff: mandatory - mapped = uncovered
  4. Run test framework → parse exit code + output
  5. Update .traceability.yaml with pass/fail status
  6. Calculate coverage % → compare to threshold
  7. Write .loomkit-verify.json
  8. Output table + exit code

/lk:archive
  1. Read .loomkit-verify.json → check passed=true
  2. If not passed → refuse (unless --force --reason)
  3. Apply delta spec merge → living specs (reuse spec-format/merge.ts)
  4. Move change dir → loomkit/archive/<date>-<name>/
  5. Write .loomkit-archive.json
```

## Verify Status File
```json
{
  "timestamp": "2026-04-29T12:00:00Z",
  "coverage": 1.0,
  "threshold": 1.0,
  "passed": true,
  "scenarios": {
    "auth-valid-credentials": "passing",
    "auth-invalid-credentials": "passing"
  }
}
```

## Archive Metadata
```json
{
  "archived_at": "2026-04-29T12:30:00Z",
  "coverage": 1.0,
  "forced": false,
  "reason": null,
  "spec_count": 1,
  "requirement_count": 5,
  "scenario_count": 8
}
```

## File Layout
```
loomkit/src/verify/
  verify.ts           — orchestrator: traceability + framework + coverage
  reporter.ts         — format table/JSON output
  status.ts           — .loomkit-verify.json read/write

loomkit/src/archive/
  archive.ts          — gated archive + spec merge + move
  metadata.ts         — .loomkit-archive.json writer
```

## Rollback
Verify is read-only. Archive can be undone: move files back from archive/ to changes/, revert living specs (keep pre-merge snapshot).
