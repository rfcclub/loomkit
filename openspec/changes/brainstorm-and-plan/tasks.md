# Tasks: Brainstorm & Plan

## 1. Brainstorm Template
- [ ] 1.1 Write failing test: brainstorm template contains all required steps (explore context, one question, 2-3 approaches, section-by-section, write proposal)
- [ ] 1.2 Implement brainstorm instruction template
- [ ] 1.3 Write failing test: validate proposal.md has required sections (Why, What Changes, Capabilities, Impact)
- [ ] 1.4 Implement proposal validator

## 2. Plan Format
- [ ] 2.1 Write failing test: parse plan task with Files header (Create/Modify/Test)
- [ ] 2.2 Implement plan task parser
- [ ] 2.3 Write failing test: parse TDD step structure (write test → verify fail → implement → verify pass → commit)
- [ ] 2.4 Implement TDD step parser
- [ ] 2.5 Write failing test: detect code block in each code step
- [ ] 2.6 Implement code block presence check

## 3. Plan Validation
- [ ] 3.1 Write failing test: detect placeholder (TBD, TODO, implement later, fill in)
- [ ] 3.2 Implement placeholder detector
- [ ] 3.3 Write failing test: detect vague instruction ("add error handling" without code block)
- [ ] 3.4 Implement vague instruction detector
- [ ] 3.5 Write failing test: detect cross-task reference ("similar to Task 3")
- [ ] 3.6 Implement cross-reference detector
- [ ] 3.7 Write failing test: detect missing file path in step
- [ ] 3.8 Implement file path presence check
- [ ] 3.9 Write failing test: detect implementation step before test step
- [ ] 3.10 Implement TDD order enforcement

## 4. Plan Self-Review
- [ ] 4.1 Write failing test: every spec requirement has at least one plan task
- [ ] 4.2 Implement spec coverage checker
- [ ] 4.3 Write failing test: function name inconsistent across tasks
- [ ] 4.4 Implement type consistency checker
