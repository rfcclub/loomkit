import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'child_process'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { fileURLToPath } from 'url'

// Real, automated version of the manual verification the 2026-08-01 handoff
// (aria-claude-handoff-2026-08-01.md) flagged as a known gap: "plan-json/
// debug-loop CLI chưa có test tự động cho toàn bộ CLI (mới test tay qua
// scratch project)." Spawns BOTH real CLIs — loomkit's and
// hammerhead-debug's — against tonight's rewritten hammerhead-debug
// (DAP-via-debug-skill + the new standalone CLI), not the old hand-rolled
// dap-client the handoff was written against.

const loomkitCli = fileURLToPath(new URL('../../dist/cli/index.js', import.meta.url))
const hammerheadCli = fileURLToPath(new URL('../../node_modules/.bin/hammerhead-debug', import.meta.url))

let cwd: string
const changeDir = 'loomkit/changes/test-change'

function loomkit(args: string[]): { stdout: string; status: number } {
  try {
    const stdout = execFileSync('node', [loomkitCli, ...args], { cwd, encoding: 'utf-8' })
    return { stdout, status: 0 }
  } catch (e) {
    const err = e as { stdout?: string; status?: number }
    return { stdout: err.stdout ?? '', status: err.status ?? 1 }
  }
}

function hammerhead(args: string[]): { stdout: string; status: number } {
  try {
    const stdout = execFileSync(hammerheadCli, [...args, '--dir', changeDir], { cwd, encoding: 'utf-8' })
    return { stdout, status: 0 }
  } catch (e) {
    const err = e as { stdout?: string; status?: number }
    return { stdout: err.stdout ?? '', status: err.status ?? 1 }
  }
}

beforeEach(() => {
  cwd = join(tmpdir(), `loomkit-hammerhead-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(cwd, { recursive: true })
  execFileSync('git', ['init', '-q'], { cwd })
  execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd })
  execFileSync('git', ['config', 'user.name', 'test'], { cwd })
  writeFileSync(join(cwd, 'app.js'), "console.log('hi')\n")
  execFileSync('git', ['add', '.'], { cwd })
  execFileSync('git', ['commit', '-q', '-m', 'init'], { cwd })

  loomkit(['intent', 'test-change'])
  writeFileSync(
    join(cwd, changeDir, 'intent.md'),
    '# Intent: test-change\n\n## Intent Approval\n\nStatus: APPROVED\n\nApproved by: test\nDate: 2026-08-04\n',
  )
  loomkit(['plan-json', 'init', 'test-change', '--trace', 'intent.md', '--resolved-by', 'test'])
  mkdirSync(join(cwd, 'tests'), { recursive: true })
  writeFileSync(join(cwd, 'tests/a.test.js'), 'console.log("test ran");\nprocess.exit(0);\n')
  loomkit([
    'plan-json', 'add', 'test-change',
    '--id', 'TASK-1', '--behavior', 'app prints hi', '--acceptance', 'console shows hi',
    '--files', 'app.js', '--test', 'tests/a.test.js',
  ])
  loomkit(['plan-json', 'start', 'test-change', 'TASK-1', '--skip-state-check'])
})

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true })
})

describe('loomkit plan-json ↔ hammerhead-debug — real end-to-end wiring', () => {
  it('a CONFIRMED debug session, pointed at the loomkit changeDir, lets the task complete', () => {
    const opened = hammerhead(['open', '--symptom', 'app doesn\'t print hi', '--repro', 'true'])
    expect(opened.status).toBe(0)
    const { session_id: sessionId } = JSON.parse(opened.stdout) as { session_id: string }

    expect(hammerhead(['hypothesis', sessionId, 'casing bug', '--predict', 'log shows hi not Hi']).status).toBe(0)
    expect(
      hammerhead(['probe', sessionId, '--kind', 'instrumentation', '--observation', "console.log output: 'hi' (lowercase, expected)"])
        .status,
    ).toBe(0)
    const verdict = hammerhead(['verdict', sessionId, '--result', 'CONFIRMED', '--reason', 'output matches expectation'])
    expect(verdict.status).toBe(0)
    expect(hammerhead(['fix', sessionId, '--diff-sha256', 'realfixsha256']).status).toBe(0)

    const complete = loomkit([
      'plan-json', 'complete', 'test-change', 'TASK-1',
      '--test-cmd', 'node tests/a.test.js',
      '--debug-session', sessionId, '--debug-cycle', 'c-1', '--root-cause', 'false alarm, output correct',
    ])
    expect(complete.status).toBe(0)
    expect(complete.stdout).toContain('complete')
  })

  it('a debug-session that does not exist is rejected, not silently accepted', () => {
    const complete = loomkit([
      'plan-json', 'complete', 'test-change', 'TASK-1',
      '--test-cmd', 'node tests/a.test.js',
      '--debug-session', 'dbg-does-not-exist', '--debug-cycle', 'c-1', '--root-cause', 'x',
    ])
    expect(complete.status).toBe(1)
  })

  it('a real session but a nonexistent cycle id is rejected', () => {
    const opened = hammerhead(['open', '--symptom', 'x', '--repro', 'true'])
    const { session_id: sessionId } = JSON.parse(opened.stdout) as { session_id: string }
    const complete = loomkit([
      'plan-json', 'complete', 'test-change', 'TASK-1',
      '--test-cmd', 'node tests/a.test.js',
      '--debug-session', sessionId, '--debug-cycle', 'c-999', '--root-cause', 'x',
    ])
    expect(complete.status).toBe(1)
  })

  it('a REFUTED cycle does not authorize completion — loomkit rejects it', () => {
    const opened = hammerhead(['open', '--symptom', 'x', '--repro', 'true'])
    const { session_id: sessionId } = JSON.parse(opened.stdout) as { session_id: string }
    hammerhead(['hypothesis', sessionId, 'wrong guess', '--predict', 'should see X'])
    hammerhead(['probe', sessionId, '--kind', 'instrumentation', '--observation', 'actual: Y, not X'])
    hammerhead(['verdict', sessionId, '--result', 'REFUTED', '--reason', 'prediction did not hold'])

    const complete = loomkit([
      'plan-json', 'complete', 'test-change', 'TASK-1',
      '--test-cmd', 'node tests/a.test.js',
      '--debug-session', sessionId, '--debug-cycle', 'c-1', '--root-cause', 'x',
    ])
    expect(complete.status).toBe(1)
  })

  it('fix without a prior CONFIRMED verdict is rejected by hammerhead-debug itself, before loomkit is even involved', () => {
    const opened = hammerhead(['open', '--symptom', 'x', '--repro', 'true'])
    const { session_id: sessionId } = JSON.parse(opened.stdout) as { session_id: string }
    const fix = hammerhead(['fix', sessionId, '--diff-sha256', 'abc'])
    expect(fix.status).toBe(1)
  })
})
