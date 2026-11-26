import { CITATIONS, STATUTORY_CONSTANTS_2026 } from "@/data/statutory-2026/rules";
import { AuditFinding, GigAuditResult, GigCaseInput } from "@/lib/engines/types";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Deterministic Gig Workers Act 2025 (Act 872) & Self-Employed Safety Net Engine.
 * Covers both freelance business owners (SOWs, invoices, i-Saraan, Lindung Kendiri)
 * and platform gig riders (7-day payout, 14-day suspension cap + 50% back-pay, 1.25% SKSPS).
 */
export function auditGigCase(input: GigCaseInput): GigAuditResult {
  const checks = [
    {
      ok: input.hasWrittenAgreement,
      en: "Written service agreement provided",
      bm: "Perjanjian perkhidmatan bertulis disediakan",
    },
    {
      ok: input.statesFeeFormula,
      en: "Clear fee / rate calculation specified",
      bm: "Formula kadar bayaran dinyatakan dengan jelas",
    },
    {
      ok: input.statesPaymentTimeline,
      en: "Clear payment deadline specified",
      bm: "Tempoh masa pembayaran dinyatakan",
    },
    {
      ok: input.statesSuspensionProcess,
      en: "Fair suspension / review notice terms included",
      bm: "Terma semakan & penggantungan akaun yang adil disertakan",
    },
  ];

  const passedCount = checks.filter((c) => c.ok).length;
  const agreementCompletenessPct = Math.round((passedCount / checks.length) * 100);
  const missingClausesEn = checks.filter((c) => !c.ok).map((c) => c.en);
  const missingClausesBm = checks.filter((c) => !c.ok).map((c) => c.bm);

  const daysOverdue = Math.max(
    0,
    input.daysSinceWorkCompleted - STATUTORY_CONSTANTS_2026.act872PayoutDeadlineDays
  );
  const isPayoutOverdue = input.invoiceOrPayoutAmountRm > 0 && daysOverdue > 0;

  const isSuspensionCapBreached =
    input.isSuspended &&
    input.suspensionDaysElapsed > STATUTORY_CONSTANTS_2026.act872SuspensionCapDays;

  const expectedBackPayRm = input.isSuspended
    ? round2(
        input.suspensionDaysElapsed *
          input.averageDailyEarningsRm *
          STATUTORY_CONSTANTS_2026.act872SuspensionBackPayRate
      )
    : 0;
  const backPayShortfallRm = round2(Math.max(0, expectedBackPayRm - input.backPayPaidRm));

  const expectedSksps125Rm = round2(
    input.monthlyGrossGigIncomeRm * STATUTORY_CONSTANTS_2026.act872SkspsContributionRate
  );
  const skspsVarianceRm = round2(
    Math.abs(input.platformSkspsDeductedRm - expectedSksps125Rm)
  );

  // KWSP i-Saraan 20% matching calculation (capped at RM500/year benchmark)
  const potentialMatch = round2(
    input.annualISaraanContributedRm * STATUTORY_CONSTANTS_2026.iSaraanMatchRate
  );
  const estimatedISaraanMatchRm = Math.min(
    potentialMatch,
    STATUTORY_CONSTANTS_2026.iSaraanAnnualCapRm
  );
  const remainingAnnualISaraanMatchRoomRm = round2(
    Math.max(0, STATUTORY_CONSTANTS_2026.iSaraanAnnualCapRm - estimatedISaraanMatchRm)
  );

  const overduePrincipalClaim = isPayoutOverdue ? input.invoiceOrPayoutAmountRm : 0;
  const totalClaimableRm = round2(overduePrincipalClaim + backPayShortfallRm);

  const findings: AuditFinding[] = [];

  if (missingClausesEn.length > 0) {
    findings.push({
      code: "ACT872_AGREEMENT_GAPS",
      severity: "warning",
      titleEn: `Service agreement completeness: ${agreementCompletenessPct}% (${missingClausesEn.length} missing protections)`,
      titleBm: `Kelengkapan perjanjian perkhidmatan: ${agreementCompletenessPct}% (${missingClausesBm.length} perkara belum lengkap)`,
      detailEn: `Missing under Act 872 Part II: ${missingClausesEn.join("; ")}.`,
      detailBm: `Belum lengkap di bawah Bahagian II Akta 872: ${missingClausesBm.join("; ")}.`,
      varianceRm: 0,
      citation: CITATIONS.ACT_872_GIG_CONTRACT,
    });
  } else {
    findings.push({
      code: "ACT872_AGREEMENT_COMPLETE",
      severity: "pass",
      titleEn: "Written service agreement covers core Act 872 safeguards",
      titleBm: "Perjanjian bertulis merangkumi perlindungan teras Akta 872",
      detailEn: "Scope, fee structure, payout timeline, and review protections are documented.",
      detailBm: "Skop, struktur bayaran, garis masa pembayaran, dan perlindungan semakan direkodkan.",
      varianceRm: 0,
      citation: CITATIONS.ACT_872_GIG_CONTRACT,
    });
  }

  if (isPayoutOverdue) {
    findings.push({
      code: "ACT872_PAYOUT_OVERDUE",
      severity: "action_needed",
      titleEn: `Earned payout/invoice (RM${input.invoiceOrPayoutAmountRm.toFixed(2)}) is ${daysOverdue} days past the 7-day benchmark`,
      titleBm: `Bayaran/invois tertunggak (RM${input.invoiceOrPayoutAmountRm.toFixed(2)}) melebihi tempoh 7 hari sebanyak ${daysOverdue} hari`,
      detailEn: `Work completed ${input.daysSinceWorkCompleted} days ago. Start with a polite Act 872 reminder before filing at the Gig Workers Tribunal if unpaid.`,
      detailBm: `Kerja selesai ${input.daysSinceWorkCompleted} hari lalu. Mulakan dengan peringatan sopan Akta 872 sebelum memfailkan di Tribunal Pekerja Gig jika belum dibayar.`,
      varianceRm: input.invoiceOrPayoutAmountRm,
      citation: CITATIONS.ACT_872_PAYOUT_SUSPENSION,
    });
  }

  if (input.isSuspended) {
    findings.push({
      code: isSuspensionCapBreached
        ? "ACT872_SUSPENSION_BREACH"
        : "ACT872_SUSPENSION_ACTIVE",
      severity: isSuspensionCapBreached || backPayShortfallRm > 0 ? "action_needed" : "info",
      titleEn: isSuspensionCapBreached
        ? `Account suspension (${input.suspensionDaysElapsed} days) exceeds the 14-day review cap`
        : `Active suspension (${input.suspensionDaysElapsed} days) — 50% inquiry allowance applies`,
      titleBm: isSuspensionCapBreached
        ? `Penggantungan akaun (${input.suspensionDaysElapsed} hari) melebihi had semakan 14 hari`
        : `Penggantungan aktif (${input.suspensionDaysElapsed} hari) — elaun semakan 50% terpakai`,
      detailEn: `Calculated 50% average daily earnings allowance = RM${expectedBackPayRm.toFixed(2)} (outstanding RM${backPayShortfallRm.toFixed(2)}).`,
      detailBm: `Elaun 50% purata pendapatan harian = RM${expectedBackPayRm.toFixed(2)} (baki belum dibayar RM${backPayShortfallRm.toFixed(2)}).`,
      varianceRm: backPayShortfallRm,
      citation: CITATIONS.ACT_872_PAYOUT_SUSPENSION,
    });
  }

  findings.push({
    code: "SKSPS_ISARAAN_PLAN",
    severity:
      input.platformSkspsDeductedRm > 0 && skspsVarianceRm > 1 ? "warning" : "info",
    titleEn: `PERKESO Lindung Kendiri (1.25%): RM${expectedSksps125Rm.toFixed(2)}/mo · KWSP i-Saraan Gov Match: RM${estimatedISaraanMatchRm.toFixed(2)}`,
    titleBm: `PERKESO Lindung Kendiri (1.25%): RM${expectedSksps125Rm.toFixed(2)}/bln · Padanan i-Saraan KWSP: RM${estimatedISaraanMatchRm.toFixed(2)}`,
    detailEn: `Remaining annual i-Saraan 20% matching headroom: RM${remainingAnnualISaraanMatchRoomRm.toFixed(2)}.`,
    detailBm: `Baki kuota padanan tahunan 20% i-Saraan: RM${remainingAnnualISaraanMatchRoomRm.toFixed(2)}.`,
    varianceRm: input.platformSkspsDeductedRm > 0 ? skspsVarianceRm : 0,
    citation: CITATIONS.ACT_872_SKSPS_TRIB,
  });

  return {
    agreementCompletenessPct,
    missingClausesEn,
    missingClausesBm,
    isPayoutOverdue,
    daysOverdue,
    isSuspensionCapBreached,
    expectedBackPayRm,
    backPayShortfallRm,
    expectedSksps125Rm,
    skspsVarianceRm,
    estimatedISaraanMatchRm,
    remainingAnnualISaraanMatchRoomRm,
    totalClaimableRm,
    findings,
  };
}
