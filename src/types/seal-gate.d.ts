// Minimal ambient declaration for `seal-gate`, a sibling package (file:../seal-gate)
// that ships TypeScript sources without a `types` field in its package.json.
// Only the surface area used by loomkit (src/harness/gate-code.ts) is declared.
// If seal-gate later ships its own types, this shim can be removed.
declare module 'seal-gate' {
  export interface ScoreBreakdown {
    base: number;
    issue_deductions: number;
    missing_evidence_deductions: number;
    risk_deductions: number;
    overconfidence_deductions: number;
    evidence_bonuses: number;
    final: number;
  }

  export interface FabricatedEvidence {
    type: 'FABRICATED_EVIDENCE';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    is_blocking: boolean;
    evidence: string;
    layer: string;
    source: string;
    citation_status: string;
    fabricated_reason: 'location_not_found' | 'content_mismatch';
    claimed_evidence: {
      file?: string;
      lines?: number[];
      quote?: string;
    };
  }

  export interface SealReviewInput {
    artifact_type: string;
    spec: string | null;
    output: string;
    evidence: {
      test_log: string;
      build_log: string;
      diff: string;
      references: Array<{
        type: string;
        command?: string;
        exit_code?: number;
        output?: string;
        path?: string;
        line?: number;
        snapshot?: string;
        [key: string]: unknown;
      }>;
    };
    risk_hint?: string | null;
    context?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface SealIssue {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    is_blocking: boolean;
    evidence: string;
    rule_id?: string;
    required_fix?: string;
    evidence_file?: string;
    evidence_lines?: number[];
    evidence_quote?: string;
    citation_status?: string;
    [key: string]: unknown;
  }

  export interface SealReviewResult {
    verdict: string;
    trust_score: number;
    risk_level: string;
    summary: string;
    blocking_issues: SealIssue[];
    non_blocking_issues: SealIssue[];
    deterministic_findings: SealIssue[];
    llm_findings: SealIssue[];
    missing_evidence: string[];
    assumptions_detected: string[];
    advisory_notes: string[];
    next_action: string;
    version: string;
    schema_version: string;
    score_breakdown: ScoreBreakdown;
    fabricated_evidence: FabricatedEvidence[];
    trust_memory_summary?: {
      agent_id: string;
      reliability_score: number | null;
      drift_trend: string;
      review_count: number;
      last_reviewed_at: number | null;
    };
    [key: string]: unknown;
  }

  export interface TrustMemoryData {
    entries?: unknown[];
  }

  export class TrustMemory {
    static fromJSON(data: TrustMemoryData): TrustMemory;
    toJSON(): TrustMemoryData;
    record(agentId: string, record: { verdict: string; trust_score: number; risk_level: string; blocking_count: number }): void;
    getSummary(agentId: string): { agent_id: string; reliability_score: number | null; drift_trend: string; review_count: number; last_reviewed_at: number | null };
  }

  export const VERSION: string;

  export function createReviewer(opts: { provider?: string; baseUrl?: string; apiKey?: string; model?: string; timeoutMs?: number }): unknown;

  export const Seal: {
    withTrustMemory(memory: TrustMemory): void;
    withLLM(adapter: unknown): void;
    review(input: SealReviewInput): Promise<SealReviewResult>;
  };
}
