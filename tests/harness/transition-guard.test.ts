import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { TransitionGuard } from '../../src/harness/transition-guard.ts'
import { createPhaseJson, recordPhaseComplete } from '../../src/harness/phase-json.ts'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `loomkit-tg-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('TransitionGuard', () => {
  it('canEnter succeeds with skip=true regardless of state', () => {
    const guard = new TransitionGuard(tmpDir)
    // Should not throw when skipping state check
    expect(() => guard.canEnter('spec', true)).not.toThrow()
  })

  it('canEnter in degraded mode (no phase.json) emits warning, does not throw', () => {
    const guard = new TransitionGuard(tmpDir)
    const warnSpy: string[] = []
    const origWarn = console.warn
    console.warn = (...args: unknown[]) => { warnSpy.push(args.join(' ')) }
    try {
      guard.canEnter('intent', false)
      expect(warnSpy.some(w => w.includes('degraded') || w.includes('phase.json'))).toBe(true)
    } finally {
      console.warn = origWarn
    }
  })

  it('canEnter intent phase when no prior phase needed', () => {
    createPhaseJson(tmpDir, 'test-change')
    const guard = new TransitionGuard(tmpDir)
    expect(() => guard.canEnter('intent', false)).not.toThrow()
  })

  it('canEnter spec fails when intent is pending', () => {
    createPhaseJson(tmpDir, 'test-change')
    const guard = new TransitionGuard(tmpDir)
    expect(() => guard.canEnter('spec', false)).toThrow(/intent.*not complete|prior phase/i)
  })

  it('canEnter spec succeeds when intent is done', () => {
    createPhaseJson(tmpDir, 'test-change')
    recordPhaseComplete(tmpDir, 'intent', [], [], { marker: 'done' })
    const guard = new TransitionGuard(tmpDir)
    expect(() => guard.canEnter('spec', false)).not.toThrow()
  })
})
