import { CITATIONS, STATUTORY_CONSTANTS_2026 } from "@/data/statutory-2026/rules";
import {
  AuditFinding,
  StampDutyInput,
  StampDutyResult,
} from "@/lib/engines/types";

/**
 * Deterministic 2026 MyTax e-Duti Setem Engine:
 * - Item 4 Employment Contracts (effective 1 Jan 2026): <= RM3,000/month is Exempt (RM0); > RM3,000/month is RM10 flat duty.
 * - Item 49(a) Commercial/Studio/Staff-Quarters Leases (2026 rules): RM2,400 exemption abolished; duty on FULL annual rent per RM250 block (or part thereof):
 *   <= 1 yr: RM1 | >1-3 yrs: RM3 | >3-5 yrs: RM5 | >5 yrs/indefinite: RM7, plus RM10 per duplicate copy.
 * - Tracks 30-day stamping window & PKPS voluntary disclosure amnesty (expiring 31 Dec 2026).
 */
export function calculateStampDuty2026(input: StampDutyInput): StampDutyResult {
  const findings: AuditFinding[] = [];
  const daysRemainingIn30DayWindow = Math.max(
    0,
    STATUTORY_CONSTANTS_2026.stampWindowDays - input.signedDaysAgo
  );
  const isPast30DayWindow =
    !input.alreadyStamped && input.signedDaysAgo > STATUTORY_CONSTANTS_2026.stampWindowDays;
  const pkpsAmnestyEligible = isPast30DayWindow && !input.alreadyStamped;

  let principalDutyRm = 0;
  let duplicateDutyRm = 0;
  let isExempt = false;
  let exemptionReasonEn = "";
  let exemptionReasonBm = "";

  if (input.instrumentType === "employment_contract") {
    if (input.isSubsidiarySupplementaryDoc) {
      isExempt = true;
      exemptionReasonEn =
        "Supplementary / operational letters linked to an already-stamped principal employment contract do not require duplicate stamping.";
      exemptionReasonBm =
        "Surat tambahan atau operasi yang berkait dengan kontrak induk yang telah disetemkan tidak memerlukan penyeteman berganda.";
    } else if (
      input.monthlyWageOrRentRm <= STATUTORY_CONSTANTS_2026.stampItem4ExemptionSalaryRm
    ) {
      isExempt = true;
      exemptionReasonEn =
        "Monthly remuneration is RM3,000 or below — exempt from stamp duty under 2026 Item 4 rules.";
      exemptionReasonBm =
        "Imbuhan bulanan ialah RM3,000 ke bawah — dikecualikan daripada duti setem di bawah peraturan Butiran 4 (2026).";
    } else {
      principalDutyRm = STATUTORY_CONSTANTS_2026.stampItem4StandardDutyRm;
      duplicateDutyRm =
        Math.max(0, input.duplicateCopies) * STATUTORY_CONSTANTS_2026.stampDuplicateCopyDutyRm;
    }

    findings.push({
      code: isExempt ? "ITEM4_EXEMPT" : "ITEM4_DUTY_REQUIRED",
      severity: isExempt ? "pass" : isPast30DayWindow ? "action_needed" : "info",
      titleEn: isExempt
        ? "Employment contract is exempt (RM0 stamp duty)"
        : `Employment contract requires RM${principalDutyRm.toFixed(2)} principal stamp duty`,
      titleBm: isExempt
        ? "Kontrak pekerjaan dikecualikan (duti setem RM0)"
        : `Kontrak pekerjaan memerlukan duti setem induk RM${principalDutyRm.toFixed(2)}`,
      detailEn: isExempt
        ? exemptionReasonEn
        : `Salary RM${input.monthlyWageOrRentRm.toFixed(2)} exceeds the RM3,000 threshold (Item 4). Stamp via MyTax e-Duti Setem.`,
      detailBm: isExempt
        ? exemptionReasonBm
        : `Gaji RM${input.monthlyWageOrRentRm.toFixed(2)} melebihi had RM3,000 (Butiran 4). Setemkan melalui e-Duti Setem MyTax.`,
      varianceRm: principalDutyRm + duplicateDutyRm,
      citation: CITATIONS.STAMP_ITEM_4,
    });
  } else {
    // Item 49(a) Commercial / Studio / Worker-Hostel Tenancy (RM2,400 exemption abolished)
    const annualRent = Math.max(0, input.monthlyWageOrRentRm * 12);
    const blocksOf250 = Math.ceil(annualRent / 250);

    let ratePerBlock = 1;
    if (input.tenancyYears > 5) {
      ratePerBlock = 7;
    } else if (input.tenancyYears > 3) {
      ratePerBlock = 5;
    } else if (input.tenancyYears > 1) {
      ratePerBlock = 3;
    }

    principalDutyRm = blocksOf250 * ratePerBlock;
    duplicateDutyRm =
      Math.max(0, input.duplicateCopies) * STATUTORY_CONSTANTS_2026.stampDuplicateCopyDutyRm;

    findings.push({
      code: "ITEM49A_ASSESSMENT",
      severity: isPast30DayWindow ? "warning" : "info",
      titleEn: `Workspace/Premises Tenancy Duty: RM${principalDutyRm.toFixed(2)} (${blocksOf250} blocks × RM${ratePerBlock})`,
      titleBm: `Duti Sewaan Premis/Ruang Kerja: RM${principalDutyRm.toFixed(2)} (${blocksOf250} blok × RM${ratePerBlock})`,
      detailEn: `Calculated on full annual rent (RM${annualRent.toFixed(2)}) with the former RM2,400 exemption abolished under 2026 Item 49(a).`,
      detailBm: `Dikira atas sewa tahunan penuh (RM${annualRent.toFixed(2)}) selepas pemansuhan pengecualian RM2,400 di bawah Butiran 49(a) 2026.`,
      varianceRm: principalDutyRm + duplicateDutyRm,
      citation: CITATIONS.STAMP_ITEM_49A,
    });
  }

  if (!isExempt && pkpsAmnestyEligible) {
    findings.push({
      code: "PKPS_AMNESTY_RECOMMENDED",
      severity: "warning",
      titleEn: "Eligible for PKPS Stamp Duty Voluntary Disclosure (Expires 31 Dec 2026)",
      titleBm: "Layak untuk Program Khas Pengakuan Sukarela (PKPS) Duti Setem (Tamat 31 Dis 2026)",
      detailEn: `Signed ${input.signedDaysAgo} days ago (past the 30-day window). Submit via MyTax e-Duti Setem under PKPS before Dec 31, 2026 to regularize without late penalties.`,
      detailBm: `Ditandatangani ${input.signedDaysAgo} hari lalu (melepasi tempoh 30 hari). Hantar melalui e-Duti Setem MyTax di bawah PKPS sebelum 31 Dis 2026 untuk pengelakan penalti lewat.`,
      varianceRm: 0,
      citation: CITATIONS.STAMP_ITEM_49A,
    });
  }

  return {
    instrumentType: input.instrumentType,
    principalDutyRm,
    duplicateDutyRm,
    totalStampDutyRm: principalDutyRm + duplicateDutyRm,
    isExempt,
    exemptionReasonEn,
    exemptionReasonBm,
    daysRemainingIn30DayWindow,
    isPast30DayWindow,
    pkpsAmnestyEligible,
    pkpsDeadline: STATUTORY_CONSTANTS_2026.pkpsAmnestyExpiryDate,
    findings,
  };
}
