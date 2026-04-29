# Tasks: TDD Enforcement

## 1. Traceability
- [ ] 1.1 Write failing test: create .traceability.yaml with scenario→test mapping
- [ ] 1.2 Implement traceability writer
- [ ] 1.3 Write failing test: read traceability and find uncovered scenarios
- [ ] 1.4 Implement uncovered scenario detector
- [ ] 1.5 Write failing test: update scenario status (pending→passing→failing)
- [ ] 1.6 Implement status updater

## 2. Test Framework Config
- [ ] 2.1 Write failing test: resolve framework command (vitest→"vitest run --reporter=json")
- [ ] 2.2 Implement framework resolver
- [ ] 2.3 Write failing test: unknown framework → error
- [ ] 2.4 Implement framework validation
- [ ] 2.5 Write failing test: custom command used when framework is "custom"
- [ ] 2.6 Implement custom command support

## 3. Coverage
- [ ] 3.1 Write failing test: coverage 80% < threshold 100% → fail
- [ ] 3.2 Implement coverage calculator (SHALL/MUST scenarios only)
- [ ] 3.3 Write failing test: SHOULD scenarios excluded from threshold
- [ ] 3.4 Implement RFC 2119-aware coverage
- [ ] 3.5 Write failing test: coverage at threshold → pass
- [ ] 3.6 Implement threshold comparison

## 4. Enforcement
- [ ] 4.1 Write failing test: task with [no-test: reason] → allowed
- [ ] 4.2 Implement no-test tag parser with reason validation
- [ ] 4.3 Write failing test: [no-test] without reason → warning
- [ ] 4.4 Implement reason requirement check
- [ ] 4.5 Write failing test: tdd.enforce=false skips all checks
- [ ] 4.6 Implement enforcement toggle
