// One-prompt agent contract. Kept in its own file so src/lib/engines/types.ts
// (shared contract, Evan-led) is untouched. Merge into types.ts after review.

export type AgentLanguage = "en" | "ms" | "zh" | "ta";

export type AgentCaseType = "employee" | "part_time" | "gig_rider" | "freelancer" | "sme";

export type AgentStepId =
  | "understand"
  | "clarify"
  | "calculate"
  | "route"
  | "draft"
  | "prefill"
  | "handoff";

export type AgentStepStatus = "done" | "needs_input" | "pending" | "skipped";

export interface AgentStep {
  id: AgentStepId;
  status: AgentStepStatus;
}

/** Facts pulled out of the user's prompt (and later answers). All numbers are user-provided. */
export interface AgentFacts {
  basicSalaryRm?: number;
  fixedAllowanceRm?: number;
  otHours?: number;
  otPaidRm?: number;
  optedOutLindung?: boolean;
  lindungDeductedRm?: number;
  hourlyRateRm?: number;
  hoursThisMonth?: number;
  bossSetsShifts?: boolean;
  suspensionDays?: number;
  averageDailyEarningsRm?: number;
  pendingPayoutRm?: number;
  daysSinceWorkCompleted?: number;
  invoiceAmountRm?: number;
  hasPaymentTerm?: boolean;
  counterpartyName?: string;
}

export type AgentFactKey = keyof AgentFacts | "payrollFile" | "caseType";

export interface AgentQuestion {
  key: AgentFactKey;
  text: string;
  kind: "number" | "yes_no" | "choice" | "upload";
  options?: { value: string; label: string }[];
}

export type AgentFindingLevel = "verified" | "potential" | "info";

export interface AgentFinding {
  level: AgentFindingLevel;
  titleMs: string;
  titleEn: string;
  amountRm: number;
  workingMs: string;
  workingEn: string;
  citation: string;
}

export type PortalId = "wfw" | "gig_eaduan" | "mytax" | "kwsp";

export interface PortalField {
  key: string;
  labelMs: string;
  value: string;
  /** "agent" = filled by Hakku; "user" = the user fills it themselves after logging in (identity data is never stored). */
  filledBy: "agent" | "user";
}

export interface PortalFillPlan {
  portalId: PortalId;
  agencyMs: string;
  agencyEn: string;
  officialUrl: string;
  /** Hakku's simulated portal mirror. Automatic filling only ever runs here in the hackathon build. */
  mirrorPath: string;
  fields: PortalField[];
  attachments: string[];
  /** Field map follows Hakku's mirror; confirm against the live portal before production. */
  fieldMapVerified: false;
}

export interface FormalBmReport {
  perkara: string;
  body: string;
  lampiran: string[];
  amountsUsedRm: number[];
}

export interface AgentRequest {
  message: string;
  mode?: "demo" | "live";
  answers?: Partial<Record<AgentFactKey, string | number | boolean>>;
  caseTypeHint?: AgentCaseType;
}

export interface AgentResponse {
  executionMode: "demo" | "live";
  modelUsed: string;
  fallbackNotice?: string;
  language: AgentLanguage;
  caseType: AgentCaseType | null;
  facts: AgentFacts;
  steps: AgentStep[];
  questions: AgentQuestion[];
  findings: AgentFinding[];
  totalRm: number;
  report: FormalBmReport | null;
  portals: PortalFillPlan[];
  /** Things only the user may do: log in with their own identity, review, and press submit. */
  handoff: { userMust: ("login" | "review" | "submit")[] } | null;
  disclaimerMs: string;
}

export interface AgentSubmitRequest {
  portalId: PortalId;
  target: "mirror" | "official";
  consentConfirmed: boolean;
  fields: PortalField[];
}

export interface AgentSubmitResponse {
  target: "mirror";
  referenceNo: string;
  submittedAt: string;
  noticeMs: string;
}
