# Tasks: Verify & Archive

## 1. Verify Orchestration
- [ ] 1.1 Write failing test: verify with full coverage → exits 0, status file written
- [ ] 1.2 Implement verify orchestrator (traceability + coverage + framework)
- [ ] 1.3 Write failing test: verify with partial coverage → exits 1, lists uncovered
- [ ] 1.4 Implement uncovered scenario reporter
- [ ] 1.5 Write failing test: verify runs test framework and updates traceability
- [ ] 1.6 Implement test framework runner in verify

## 2. Verify Reporting
- [ ] 2.1 Write failing test: verify outputs per-scenario table (✓/✗ + test file)
- [ ] 2.2 Implement scenario table reporter
- [ ] 2.3 Write failing test: JSON output with --json flag
- [ ] 2.4 Implement JSON reporter

## 3. Verify Status File
- [ ] 3.1 Write failing test: .loomkit-verify.json written after verify
- [ ] 3.2 Implement verify status writer
- [ ] 3.3 Write failing test: stale verify (>1h old) triggers re-verify warning
- [ ] 3.4 Implement staleness check

## 4. Archive Gate
- [ ] 4.1 Write failing test: archive without verify → refused
- [ ] 4.2 Implement verify gate check
- [ ] 4.3 Write failing test: archive after verify fail → refused
- [ ] 4.4 Write failing test: archive after verify pass → proceeds, specs merged
- [ ] 4.5 Implement archive with gate enforcement + spec merge
- [ ] 4.6 Write failing test: --force without --reason → refused
- [ ] 4.7 Implement --force --reason override
- [ ] 4.8 Write failing test: --force with reason → proceeds, reason in metadata

## 5. Archive Metadata
- [ ] 5.1 Write failing test: archive metadata written with coverage + counts
- [ ] 5.2 Implement metadata writer
