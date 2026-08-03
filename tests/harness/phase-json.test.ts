import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  createPhaseJson,
  readPhaseJson,
  writePhaseJson,
  recordPhaseComplete,
  recordGateVerdict,
  sha256String,
} from '../../src/harness/phase-json.ts'
import type { VerdictEntry } from '../../src/harness/types.ts'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-pj-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('phase-json', () => {
  it('createPhaseJson creates a valid phase.json', () => {
    createPhaseJson(tmpDir, 'test-change')
    const pj = readPhaseJson(tmpDir)
    expect(pj.change_id).toBe('test-change')
    expect(pj.phases).toBeDefined()
    expect(pj.phases['intent'].status).toBe('pending')
  })

  it('all lifecycle phases are pending after create', () => {
    createPhaseJson(tmpDir, 'x')
    const pj = readPhaseJson(tmpDir)
    for (const phase of Object.keys(pj.phases)) {
      expect(pj.phases[phase].status).toBe('pending')
    }
  })

  it('recordPhaseComplete marks phase done', () => {
    createPhaseJson(tmpDir, 'x')
    recordPhaseComplete(tmpDir, 'intent', [], [], { marker: 'test' })
    const pj = readPhaseJson(tmpDir)
    expect(pj.phases['intent'].status).toBe('complete')
    expect(pj.phases['intent'].completed_at).toBeDefined()
  })

  it('recordPhaseComplete stores consumed and produced', () => {
    createPhaseJson(tmpDir, 'x')
    const consumed = [{ path: 'a.md', sha256: 'abc' }]
    const produced = [{ path: 'b.md', sha256: 'def' }]
    recordPhaseComplete(tmpDir, 'plan', consumed, produced, {})
    const pj = readPhaseJson(tmpDir)
    expect(pj.phases['plan'].consumed).toEqual(consumed)
    expect(pj.phases['plan'].produced).toEqual(produced)
  })

  it('recordGateVerdict stores gate verdict in phase.json', () => {
    createPhaseJson(tmpDir, 'x')
    const v: VerdictEntry = {
      verdict: 'PASS',
      bound_diff_sha256: 'sha-abc',
      evidence_bound: { test_log_sha256: null, build_log_sha256: null },
    }
    recordGateVerdict(tmpDir, v)
    const pj = readPhaseJson(tmpDir)
    expect(pj.gate_code_verdict?.verdict).toBe('PASS')
    expect(pj.gate_code_verdict?.bound_diff_sha256).toBe('sha-abc')
  })

  it('sha256String is deterministic', () => {
    const a = sha256String('hello world')
    const b = sha256String('hello world')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('sha256String differs for different inputs', () => {
    expect(sha256String('a')).not.toBe(sha256String('b'))
  })

  it('writePhaseJson round-trips', () => {
    createPhaseJson(tmpDir, 'x')
    const pj = readPhaseJson(tmpDir)
    pj.change_id = 'mutated'
    writePhaseJson(tmpDir, pj)
    const pj2 = readPhaseJson(tmpDir)
    expect(pj2.change_id).toBe('mutated')
  })
})
