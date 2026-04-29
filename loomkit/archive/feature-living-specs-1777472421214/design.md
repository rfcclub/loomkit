## Architecture

### Archive flow (modified)

```
archive change/
  ├── 1. Read delta spec from specs/<name>/spec.md
  ├── 2. Check if loomkit/specs/<name>/spec.md exists
  │   ├── No  → copy delta as living spec
  │   └── Yes → parse both, mergeSpecs(), write result
  ├── 3. Bump package.json version (patch)
  ├── 4. Create git tag (v{version})
  ├── 5. Move change dir to archive/ (existing behavior)
  └── 6. Write archive metadata with version info
```

### Publish command (new)

```
loomkit publish [--dry-run]
  ├── 1. Read current version from package.json
  ├── 2. Show unpublished changes from archive/ since last tag
  ├── 3. If --dry-run: pack, show preview, exit
  ├── 4. npm publish
  ├── 5. git push --tags
  └── 6. Print success
```

## Components

| File | Change |
|------|--------|
| `src/cli/commands/archive.ts` | Modified — add spec merge + version bump |
| `src/cli/commands/publish.ts` | New — publish command |
| `src/cli/index.ts` | Modified — register publish command |
| `src/spec/delta.ts` | Reuse mergeSpecs() — no changes needed |

## Test Strategy

| Scenario ID | Test | Type |
|-------------|------|------|
| Archive with no existing living spec | Unit: create change with spec, archive, verify living spec exists | Unit |
| Archive with existing living spec | Unit: archive twice, verify merge | Unit |
| Archive bumps version | Unit: check package.json after archive | Unit |
| Publish dry-run | Mock: --dry-run flag, verify no publish | Integration |
| Publish live | Manual: after verify, run publish | Manual |

## Dependencies

- `semver` package for version bump (or manual parse)
- Existing: `fs`, `path` — no new deps

## Risks / Trade-offs

- Version bump is minimal (patch only). Major/minor bumps done manually via git
- Spec merge uses existing `mergeSpecs()` — must handle file I/O errors
- Living specs dir created if not exists
