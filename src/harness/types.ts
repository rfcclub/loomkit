export const LIFECYCLE = [
  'intent', 'plan', 'branch', 'apply',
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

export interface TaskArtifact {
  path: string
  sha256: string | null
}

export interface DebugRefCost {
  refuted_cycles: number
  escalated: boolean
}

export interface DebugRef {
  session: string
  resolved_by_cycle: string
  root_cause: string
  cost: DebugRefCost
}

export type TaskStatus = 'pending' | 'in_progress' | 'complete'

export interface PlanTask {
  id: string
  status: TaskStatus
  behavior: string
  acceptance: string
  files: string[]
  test: string
  consumes: TaskArtifact[]
  produces: TaskArtifact[]
  debug_ref?: DebugRef
}

export interface PlanTraceRef {
  target: string
  status: 'RESOLVED' | 'PENDING'
  resolved_by?: string
  resolved_at?: string
}

export interface PlanEscalation {
  max_improvement_iterations: number
}

export interface PlanJson {
  schema_version: '1.0'
  change_id: string
  traces_to: PlanTraceRef
  tasks: PlanTask[]
  escalation: PlanEscalation
}
