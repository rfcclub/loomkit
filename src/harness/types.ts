export const LIFECYCLE = [
  'intent', 'spec', 'branch', 'tdd', 'apply',
  'gate-code', 'verify', 'finish', 'archive', 'learn'
] as const

export type Phase = typeof LIFECYCLE[number]
export type GateVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'REVISE' | 'ESCALATE_TO_HUMAN' | 'BLOCK'

export interface ArtifactRef {
  path?: string
  sha256: string
  type?: string
  approval?: string
}

export interface AuthorizedExit {
  type: 'human_signoff' | 'tool'
  marker: string
  by?: string
  at?: string
}

export interface PhaseEntry {
  status: 'pending' | 'in_progress' | 'complete' | 'stale'
  completed_at?: string
  consumed: ArtifactRef[]
  produced: ArtifactRef[]
  authorized_exit_by?: AuthorizedExit | null
}

export interface VerdictEntry {
  verdict: GateVerdict
  bound_diff_sha256: string
  evidence_bound: {
    test_log_sha256?: string | null
    build_log_sha256?: string | null
  }
}

export interface PhaseJson {
  schema_version: '1.3'
  change_id: string
  invariants: {
    require_artifact_hashes: true
    require_provenance_chain: true
    require_verdict_before_finish: true
  }
  current_phase: Phase
  lifecycle: typeof LIFECYCLE
  phases: Record<Phase, PhaseEntry>
  gate_code_verdict?: VerdictEntry
}

export interface EvidenceReference {
  type: 'command' | 'file' | 'log'
  command?: string
  exit_code?: number
  output?: string
  file?: string
  content?: string
}

export interface SelfCheckArtifact {
  claims: string[]
  evidence: EvidenceReference[]
  known_limitations: string[]
  unresolved_assumptions: string[]
}
