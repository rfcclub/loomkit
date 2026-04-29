# Design: Spec Format

## Approach
Markdown-based spec format parsed line-by-line into structured data. Same format as OpenSpec's spec-driven schema, extended with typed assertions and scenario IDs.

## Parser Architecture (from OpenSpec)
OpenSpec uses `parsers/requirement-blocks.ts` to extract requirement blocks from markdown. LoomKit reimplements this parser with added assertion parsing.

```
spec.md → line parser → SpecTree
  SpecTree = { purpose, schema_version, requirements: Requirement[] }
  Requirement = { id, title, strength (SHALL/MUST/SHOULD/MAY), description, scenarios: Scenario[] }
  Scenario = { id, when: Condition[], then: Assertion[] }
  Assertion = { target, operator, expected }
```

## Delta Spec Parsing (from OpenSpec)
OpenSpec's `specs-apply.ts` handles delta operations. LoomKit reimplements:
- `## ADDED Requirements` → append to living spec
- `## MODIFIED Requirements` → replace matching requirement by name
- `## REMOVED Requirements` → remove from living spec (requires Reason + Migration)
- `## RENAMED Requirements` → rename requirement header (FROM:/TO:)

## Assertion Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `=` | Exact equality | `response.status = 200` |
| `!=` | Not equal | `response.error != null` |
| `contains` | String/array contains | `response.body.roles contains "admin"` |
| `matches` | Regex match | `response.body.token matches /^eyJ/` |
| `is a` | Type check | `response.body.token is a valid JWT` |
| `>` / `<` | Numeric comparison | `response.body.count > 0` |

## File Layout
```
loomkit/src/spec/
  parser.ts          — parse spec.md → SpecTree (from OpenSpec pattern)
  validator.ts       — validate structure, RFC 2119, scenario format
  assertion.ts       — parse THEN clauses into typed assertions
  delta.ts           — parse delta spec operations (ADDED/MODIFIED/REMOVED/RENAMED)
  merge.ts           — apply delta specs to living specs (from OpenSpec specs-apply)
```

## Test Strategy
- Unit tests: parser, validator, assertion parser, delta parser, merge logic
- Each parser tested with real markdown snippets
- Delta merge tested with before/after spec files

## Rollback
Parser is read-only. Merge operations can be reversed by keeping pre-merge snapshot.
