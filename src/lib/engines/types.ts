export type AppLocale = "en" | "bm";

export type UserPersona = "freelancer" | "sme" | "worker";

export type IlmuExecutionMode = "demo" | "live";

export interface MyDigitalIdProfile {
  authenticated: boolean;
  nama: string;
  maskedNric: string;
  tin: string;
  ssmNo?: string;
  companyName?: string;
  citizenship: "citizen" | "foreign";
  verifiedAt: string;
  authMethod: "MyDigital ID (Simulated SSO)" | "Guest Demo";
}

export interface StatutoryCitation {
  act: string;
  section: string;
  summaryEn: string;
  summaryBm: string;
}

export interface PayrollEmployeeInput {
  id: string;
  name: string;
  citizenship: "citizen" | "foreign";
  ageGroup: "under_60" | "60_plus";
  basicSalaryRm: number;
  fixedAllowanceRm: number;
  commissionOrBonusRm: number;
  normalDailyHours: number;
  normalOtHours: number;
  restDayHours: number;
  publicHolidayHours: number;
  lindung24JamOptOut: boolean;
  declaredPayslip?: {
    basicPaidRm: number;
    allowancePaidRm: number;
    otPaidRm: number;
    epfEmployeeDeductedRm: number;
    epfEmployerContributedRm: number;
    socsoEmployeeDeductedRm: number;
    socsoEmployerContributedRm: number;
    eisEmployeeDeductedRm: number;
    eisEmployerContributedRm: number;
    lindung24JamDeductedRm: number;
    netPaidRm: number;
  };
}

export interface AuditFinding {
  code: string;
  severity: "pass" | "info" | "warning" | "action_needed";
  titleEn: string;
  titleBm: string;
  detailEn: string;
  detailBm: string;
  varianceRm: number;
  citation: StatutoryCitation;
}

export interface PayrollEmployeeAudit {
  employeeId: string;
  employeeName: string;
  citizenship: "citizen" | "foreign";
  grossStatutoryWagesRm: number;
  orpRm: number;
  hrpRm: number;
  expected: {
    basicSalaryRm: number;
    allowanceRm: number;
    otPayRm: number;
    epfEmployeeRm: number;
    epfEmployerRm: number;
    socsoEmployeeRm: number;
    socsoEmployerRm: number;
    eisEmployeeRm: number;
    eisEmployerRm: number;
    lindung24JamEmployeeRm: number;
    netPayRm: number;
    totalEmployerCostRm: number;
  };
  findings: AuditFinding[];
  totalShortfallOrVarianceRm: number;
  complianceScore: number;
}

export interface GigCaseInput {
  workerName: string;
  roleType: "freelance_business" | "gig_rider";
  platformOrClientName: string;
  hasWrittenAgreement: boolean;
  statesFeeFormula: boolean;
  statesPaymentTimeline: boolean;
  statesSuspensionProcess: boolean;
  invoiceOrPayoutAmountRm: number;
  daysSinceWorkCompleted: number;
  isSuspended: boolean;
  suspensionDaysElapsed: number;
  averageDailyEarningsRm: number;
  backPayPaidRm: number;
  platformSkspsDeductedRm: number;
  monthlyGrossGigIncomeRm: number;
  annualISaraanContributedRm: number;
}

export interface GigAuditResult {
  agreementCompletenessPct: number;
  missingClausesEn: string[];
  missingClausesBm: string[];
  isPayoutOverdue: boolean;
  daysOverdue: number;
  isSuspensionCapBreached: boolean;
  expectedBackPayRm: number;
  backPayShortfallRm: number;
  expectedSksps125Rm: number;
  skspsVarianceRm: number;
  estimatedISaraanMatchRm: number;
  remainingAnnualISaraanMatchRoomRm: number;
  totalClaimableRm: number;
  findings: AuditFinding[];
}

export type StampInstrumentType = "employment_contract" | "tenancy_workspace";

export interface StampDutyInput {
  instrumentType: StampInstrumentType;
  monthlyWageOrRentRm: number;
  tenancyYears: number;
  duplicateCopies: number;
  signedDaysAgo: number;
  isSubsidiarySupplementaryDoc?: boolean;
  alreadyStamped: boolean;
}

export interface StampDutyResult {
  instrumentType: StampInstrumentType;
  principalDutyRm: number;
  duplicateDutyRm: number;
  totalStampDutyRm: number;
  isExempt: boolean;
  exemptionReasonEn: string;
  exemptionReasonBm: string;
  daysRemainingIn30DayWindow: number;
  isPast30DayWindow: boolean;
  pkpsAmnestyEligible: boolean;
  pkpsDeadline: string;
  findings: AuditFinding[];
}

export interface PortalSyncPayload {
  sourcePersona: UserPersona;
  generatedAt: string;
  entityOrWorkerName: string;
  employerName?: string;
  platformOrClientName?: string;
  payrollSummary?: {
    totalEmployees: number;
    citizenCount: number;
    foreignCount: number;
    totalEpfEmployeeRm: number;
    totalEpfEmployerRm: number;
    totalSocsoEmployeeRm: number;
    totalSocsoEmployerRm: number;
    totalEisEmployeeRm: number;
    totalEisEmployerRm: number;
    totalLindung24JamRm: number;
    underpaymentVarianceRm: number;
    employees: PayrollEmployeeAudit[];
  };
  gigSummary?: {
    caseTitle: string;
    totalClaimableRm: number;
    daysOverdue: number;
    suspensionDays: number;
    expectedSksps125Rm: number;
    iSaraanMatchRm: number;
    findingsCount: number;
  };
  stampDutySummary?: StampDutyResult & {
    partyName: string;
    monthlyAmountRm: number;
  };
  draftedNotice?: {
    title: string;
    bodyEn: string;
    bodyBm: string;
  };
}
