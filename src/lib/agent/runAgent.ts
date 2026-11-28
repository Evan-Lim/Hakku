// One-prompt agent orchestrator (pure, no network): understand → clarify → calculate →
// route → draft formal BM → prefill plan → hand off to the user for login/review/submit.
// Used directly by /api/agent (demo + as the base for live) and by browserBridge on the
// static Netlify export, so the demo works with or without a server.

import { auditEmployeePayroll } from "@/lib/engines/payrollEngine";
import { auditGigCase } from "@/lib/engines/gigEngine";
import { auditPartTimePay } from "@/lib/engines/partTimeEngine";
import type { GigCaseInput, PayrollEmployeeInput } from "@/lib/engines/types";
import type { AgentCaseType, AgentFacts, AgentFinding, AgentRequest, AgentResponse, AgentStep } from "./types";
import { applyAnswers, buildQuestions, classifyCase, detectLanguage, extractFacts, missingFacts, OT } from "./understand";
import { buildFillPlan, rmText, routeAgencies } from "./portals";
import { buildFormalBmReport, partyOrPlaceholder } from "./report";

export const AGENT_DISCLAIMER_MS =
  "Kiraan dibuat oleh enjin Hakku berdasarkan maklumat anda, bukan oleh AI. Ini panduan, bukan nasihat undang-undang. Anda sendiri yang log masuk, menyemak dan menghantar aduan.";

const round2 = (n: number) => Math.round(n * 100) / 100;

function steps(stage: "clarify" | "handoff"): AgentStep[] {
  const ids: AgentStep["id"][] = ["understand", "clarify", "calculate", "route", "draft", "prefill", "handoff"];
  if (stage === "clarify") return ids.map((id) => ({ id, status: id === "understand" ? "done" : id === "clarify" ? "needs_input" : "pending" }));
  return ids.map((id) => ({ id, status: id === "handoff" ? "needs_input" : "done" }));
}

function employeeFindings(f: AgentFacts): AgentFinding[] {
  const base: PayrollEmployeeInput = {
    id: "agent", name: "Pengadu", citizenship: "citizen", ageGroup: "under_60",
    basicSalaryRm: f.basicSalaryRm ?? 0, fixedAllowanceRm: f.fixedAllowanceRm ?? 0, commissionOrBonusRm: 0,
    normalDailyHours: 8, normalOtHours: f.otHours ?? 0, restDayHours: 0, publicHolidayHours: 0,
    lindung24JamOptOut: f.optedOutLindung ?? false,
  };
  // Pass 1: what the law expects. Pass 2: compare against what the user says was paid;
  // anything the user didn't mention is assumed correct so we never invent a shortfall.
  const expected = auditEmployeePayroll(base).expected;
  const lindungIfEnrolled = auditEmployeePayroll({ ...base, lindung24JamOptOut: false }).expected.lindung24JamEmployeeRm;
  const declared = {
    basicPaidRm: base.basicSalaryRm, allowancePaidRm: base.fixedAllowanceRm,
    otPaidRm: f.otPaidRm ?? expected.otPayRm,
    epfEmployeeDeductedRm: expected.epfEmployeeRm, epfEmployerContributedRm: expected.epfEmployerRm,
    socsoEmployeeDeductedRm: expected.socsoEmployeeRm, socsoEmployerContributedRm: expected.socsoEmployerRm,
    eisEmployeeDeductedRm: expected.eisEmployeeRm, eisEmployerContributedRm: expected.eisEmployerRm,
    lindung24JamDeductedRm: f.optedOutLindung ? f.lindungDeductedRm ?? lindungIfEnrolled : expected.lindung24JamEmployeeRm,
    netPaidRm: expected.netPayRm,
  };
  const audit = auditEmployeePayroll({ ...base, declaredPayslip: declared });
  const POTENTIAL = new Set(["MIN_WAGE_BELOW_1700", "LINDUNG_24JAM_MISMATCH"]);
  return audit.findings
    .filter((x) => x.severity !== "pass" && x.varianceRm > 0)
    .map((x) => ({
      level: POTENTIAL.has(x.code) ? "potential" : "verified",
      titleMs: x.titleBm, titleEn: x.titleEn, amountRm: round2(x.varianceRm),
      workingMs: x.detailBm, workingEn: x.detailEn, citation: `${x.citation.act}, ${x.citation.section}`,
    }));
}

function partTimeFindings(f: AgentFacts): AgentFinding[] {
  const r = auditPartTimePay({ hourlyRateRm: f.hourlyRateRm ?? 0, hoursThisMonth: f.hoursThisMonth ?? 0, bossSetsShifts: f.bossSetsShifts ?? false, epfDeducted: false });
  const out: AgentFinding[] = [];
  if (r.isBelowMinimum) out.push({
    level: "verified", titleMs: "Gaji sejam di bawah kadar minimum", titleEn: "Hourly pay below the minimum", amountRm: r.shortfallRm,
    workingMs: `Kadar bayaran ialah ${rmText(f.hourlyRateRm ?? 0)} sejam, sedangkan kadar minimum ialah ${rmText(r.minimumHourlyRm)}. Ini bermakna terdapat kekurangan ${rmText(r.hourlyShortfallRm)} bagi setiap jam, iaitu ${rmText(r.shortfallRm)} bagi ${f.hoursThisMonth} jam bekerja bulan ini.`,
    workingEn: `You are paid ${rmText(f.hourlyRateRm ?? 0)} an hour, but the minimum is ${rmText(r.minimumHourlyRm)}. That is ${rmText(r.hourlyShortfallRm)} too little for every hour, which comes to ${rmText(r.shortfallRm)} for the ${f.hoursThisMonth} hours you worked this month.`,
    citation: "Perintah Gaji Minimum 2024, P.U.(A) 376/2024",
  });
  if (r.missingStatutoryContributions) out.push({
    level: "potential", titleMs: "Caruman KWSP dan PERKESO mungkin tidak dibuat", titleEn: "EPF and SOCSO may be missing", amountRm: 0,
    workingMs: "Majikan menetapkan syif dan cara kerja, maka hubungan ini berkemungkinan besar hubungan pekerja dan majikan walaupun kerja itu dipanggil 'freelance'. Ini bermakna caruman KWSP dan PERKESO sepatutnya dibuat.",
    workingEn: "Your employer decides your shifts and how you work, so you are most likely an employee even though the job is called 'freelance'. That means EPF and SOCSO should be paid for you.",
    citation: "Akta Kerja 1955; Akta KWSP 1991",
  });
  return out;
}

function gigFindings(caseType: AgentCaseType, f: AgentFacts): AgentFinding[] {
  const rider = caseType === "gig_rider";
  const input: GigCaseInput = {
    workerName: "Pengadu", roleType: rider ? "gig_rider" : "freelance_business",
    platformOrClientName: partyOrPlaceholder(caseType, f.counterpartyName),
    hasWrittenAgreement: rider, statesFeeFormula: rider, statesPaymentTimeline: f.hasPaymentTerm ?? false, statesSuspensionProcess: rider,
    invoiceOrPayoutAmountRm: (rider ? f.pendingPayoutRm : f.invoiceAmountRm) ?? 0,
    daysSinceWorkCompleted: f.daysSinceWorkCompleted ?? 0,
    isSuspended: rider && (f.suspensionDays ?? 0) > 0, suspensionDaysElapsed: rider ? f.suspensionDays ?? 0 : 0,
    averageDailyEarningsRm: f.averageDailyEarningsRm ?? 0, backPayPaidRm: 0,
    platformSkspsDeductedRm: 0, monthlyGrossGigIncomeRm: 0, annualISaraanContributedRm: 0,
  };
  const r = auditGigCase(input);
  const out: AgentFinding[] = [];
  if (rider && r.isSuspensionCapBreached && r.expectedBackPayRm > 0) out.push({
    level: "potential", titleMs: "Elaun penggantungan 50%", titleEn: "50% suspension allowance", amountRm: round2(r.expectedBackPayRm),
    workingMs: `Akaun telah digantung selama ${f.suspensionDays} hari, melebihi had 14 hari. Separuh daripada purata pendapatan harian ${rmText(f.averageDailyEarningsRm ?? 0)} ialah ${rmText((f.averageDailyEarningsRm ?? 0) / 2)} sehari, jadi elaun bagi ${f.suspensionDays} hari ialah ${rmText(r.expectedBackPayRm)}. Ini terpakai jika tiada alasan sah untuk penggantungan ditemui.`,
    workingEn: `Your account has been suspended for ${f.suspensionDays} days, which is longer than the 14 days allowed. Half of your average daily earnings of ${rmText(f.averageDailyEarningsRm ?? 0)} is ${rmText((f.averageDailyEarningsRm ?? 0) / 2)} a day, so the allowance for ${f.suspensionDays} days is ${rmText(r.expectedBackPayRm)}. This applies if no valid reason for the suspension is found.`,
    citation: "Akta Pekerja Gig 2025 (Akta 872)",
  });
  if (r.isPayoutOverdue && input.invoiceOrPayoutAmountRm > 0) {
    const term = f.hasPaymentTerm === true;
    out.push({
      level: term ? "potential" : "verified", titleMs: rider ? "Bayaran pendapatan lewat" : "Invois tertunggak", titleEn: rider ? "Late payout" : "Overdue invoice",
      amountRm: round2(input.invoiceOrPayoutAmountRm),
      workingMs: term
        ? `Kerja itu siap ${f.daysSinceWorkCompleted} hari lalu. Tarikh bayaran dalam perjanjian perlu disemak untuk mengesahkan sama ada bayaran ini sudah lewat.`
        : `Kerja itu siap ${f.daysSinceWorkCompleted} hari lalu dan tiada tarikh bayaran dipersetujui, jadi bayaran sepatutnya dibuat dalam tempoh 7 hari. Bayaran ini kini lewat ${r.daysOverdue} hari.`,
      workingEn: term
        ? `The work was finished ${f.daysSinceWorkCompleted} days ago. Please check the payment date in your agreement to confirm whether this payment is late.`
        : `The work was finished ${f.daysSinceWorkCompleted} days ago and no payment date was agreed, so you should have been paid within 7 days. The payment is now ${r.daysOverdue} days late.`,
      citation: "Akta Pekerja Gig 2025 (Akta 872)",
    });
  }
  return out;
}

const CATEGORY_MS: Record<AgentCaseType, string> = {
  employee: "Gaji / kerja lebih masa tidak dibayar",
  part_time: "Gaji di bawah kadar minimum",
  gig_rider: "Penggantungan akaun melebihi 14 hari / bayaran lewat",
  freelancer: "Bayaran pendapatan tertunggak",
  sme: "Caruman dan penyeteman",
};

export function runAgent(req: AgentRequest, now: Date = new Date()): AgentResponse {
  const text = (req.message ?? "").slice(0, 4000);
  const language = detectLanguage(text);
  const answeredType = req.answers?.caseType as AgentCaseType | undefined;
  const caseType = answeredType ?? req.caseTypeHint ?? classifyCase(text);
  const facts = applyAnswers(extractFacts(text, caseType), req.answers as Record<string, unknown> | undefined);
  const base = { executionMode: "demo" as const, modelUsed: "hakku-agent-rules (Sovereign Sandbox)", language, caseType, facts, disclaimerMs: AGENT_DISCLAIMER_MS };

  const missing = missingFacts(caseType, facts, Boolean(req.answers?.payrollFile), new RegExp(OT, "i").test(text));
  if (!caseType || missing.length > 0) {
    return { ...base, steps: steps("clarify"), questions: buildQuestions(missing, language), findings: [], totalRm: 0, report: null, portals: [], handoff: null };
  }

  const findings =
    caseType === "employee" ? employeeFindings(facts)
    : caseType === "part_time" ? partTimeFindings(facts)
    : caseType === "gig_rider" || caseType === "freelancer" ? gigFindings(caseType, facts)
    : [];
  const totalRm = round2(findings.reduce((s, x) => s + x.amountRm, 0));
  const counterparty = partyOrPlaceholder(caseType, facts.counterpartyName);
  const report = buildFormalBmReport(caseType, findings, totalRm, facts.counterpartyName);
  const portals = findings.length
    ? routeAgencies(caseType).map((portalId) => buildFillPlan({ portalId, caseType, counterparty, categoryMs: CATEGORY_MS[caseType], totalRm, report, now }))
    : [];

  return {
    ...base,
    steps: steps("handoff"),
    questions: [],
    findings,
    totalRm,
    report: findings.length ? report : null,
    portals,
    handoff: findings.length ? { userMust: ["login", "review", "submit"] } : null,
  };
}
