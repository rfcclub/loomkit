## Why

Archive hiện chỉ move thư mục change vào archive/ — không merge spec vào living specs, không bump version. LoomKit chưa thể dùng cho quy trình thực tế.

## What Changes

- `loomkit archive` merge delta spec vào `loomkit/specs/<capability>/spec.md` (living specs)
- `loomkit archive` auto bump version + git tag
- `loomkit publish` — publish version lên npm

## Capabilities

### New Capabilities
- `living-specs`: Archive merge delta vào living specs, tạo changelog
- `auto-publish`: Archive tự động bump version, git tag, npm publish

## Non-Goals

- Không tự động merge spec (chỉ delta merge — archive operator vẫn manual)
- Không auto version strategy (chỉ bump minor, user bump major manual)

## Impact

- `src/cli/commands/archive.ts` — thêm merge logic
- `src/cli/commands/publish.ts` — new command
- `src/spec/delta.ts` — đã có mergeSpecs, cần file IO
