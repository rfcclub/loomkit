# Tasks: Config & Schema System

## 1. Config Loading
- [ ] 1.1 Write failing test: load config.yaml → validated LoomKitConfig
- [ ] 1.2 Implement config loader (read + parse + validate)
- [ ] 1.3 Write failing test: empty config → all defaults applied
- [ ] 1.4 Implement default merge
- [ ] 1.5 Write failing test: config not found → defaults, no error
- [ ] 1.6 Implement missing config fallback

## 2. Config Validation
- [ ] 2.1 Write failing test: coverage_threshold >100 → error
- [ ] 2.2 Implement threshold range validation
- [ ] 2.3 Write failing test: unknown framework → error with supported list
- [ ] 2.4 Implement framework enum validation

## 3. Env Var Substitution
- [ ] 3.1 Write failing test: ${VAR} replaced with env var value
- [ ] 3.2 Implement env var substitution
- [ ] 3.3 Write failing test: undefined env var → error
- [ ] 3.4 Implement undefined env var check

## 4. Schema Loading
- [ ] 4.1 Write failing test: load schema.yaml → parsed schema with artifacts
- [ ] 4.2 Implement schema loader
- [ ] 4.3 Write failing test: resolve artifact dependencies (specs requires proposal)
- [ ] 4.4 Implement dependency resolver
- [ ] 4.5 Write failing test: load template for artifact
- [ ] 4.6 Implement template loader

## 5. Context & Rules Injection
- [ ] 5.1 Write failing test: context injected into artifact instruction
- [ ] 5.2 Implement context injection
- [ ] 5.3 Write failing test: rules injected for matching artifact
- [ ] 5.4 Implement per-artifact rules injection
