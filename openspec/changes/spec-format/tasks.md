# Tasks: Spec Format

## 1. Spec Parser
- [ ] 1.1 Write failing test: parse spec with title, purpose, requirements → SpecTree
- [ ] 1.2 Implement spec parser (line-based markdown → SpecTree)
- [ ] 1.3 Write failing test: parse requirement with RFC 2119 keyword → extract strength
- [ ] 1.4 Implement RFC 2119 extraction (SHALL/MUST/SHOULD/MAY)
- [ ] 1.5 Write failing test: parse scenario with WHEN/THEN → Condition[] + Assertion[]
- [ ] 1.6 Implement scenario parser
- [ ] 1.7 Write failing test: parse THEN with assertion operators (=, !=, contains, matches, >, <, is a)
- [ ] 1.8 Implement assertion parser with all operators
- [ ] 1.9 Write failing test: AND chaining in WHEN and THEN
- [ ] 1.10 Implement AND chaining support

## 2. Validator
- [ ] 2.1 Write failing test: spec missing Purpose → validation error
- [ ] 2.2 Implement structural validator (required sections)
- [ ] 2.3 Write failing test: requirement without RFC 2119 → warning
- [ ] 2.4 Implement RFC 2119 warning
- [ ] 2.5 Write failing test: scenario without THEN → validation error
- [ ] 2.6 Implement scenario format validator
- [ ] 2.7 Write failing test: scenario with OR → validation error
- [ ] 2.8 Implement OR rejection
- [ ] 2.9 Write failing test: unsupported schema_version → warning
- [ ] 2.10 Implement schema version check

## 3. Scenario IDs
- [ ] 3.1 Write failing test: auto-generate scenario ID from requirement name + index
- [ ] 3.2 Implement ID generation (kebab-case from requirement + scenario slug)

## 4. Delta Specs
- [ ] 4.1 Write failing test: parse ADDED requirements section
- [ ] 4.2 Implement ADDED delta parser
- [ ] 4.3 Write failing test: parse MODIFIED requirements section
- [ ] 4.4 Implement MODIFIED delta parser
- [ ] 4.5 Write failing test: parse REMOVED requirements (requires Reason + Migration)
- [ ] 4.6 Implement REMOVED delta parser with validation
- [ ] 4.7 Write failing test: parse RENAMED requirements (FROM:/TO:)
- [ ] 4.8 Implement RENAMED delta parser

## 5. Spec Merge
- [ ] 5.1 Write failing test: merge ADDED requirements into living spec
- [ ] 5.2 Implement ADDED merge
- [ ] 5.3 Write failing test: merge MODIFIED requirements (replace matching)
- [ ] 5.4 Implement MODIFIED merge
- [ ] 5.5 Write failing test: merge REMOVED requirements (remove from living spec)
- [ ] 5.6 Implement REMOVED merge
- [ ] 5.7 Write failing test: merge RENAMED requirements
- [ ] 5.8 Implement RENAMED merge
