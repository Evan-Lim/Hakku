import { CITATIONS, STATUTORY_CONSTANTS_2026 } from "@/data/statutory-2026/rules";
import {
  AuditFinding,
  PayrollEmployeeAudit,
  PayrollEmployeeInput,
} from "@/lib/engines/types";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function roundToNearestFiveSen(n: number): number {
  return Math.round((n + Number.EPSILON) * 20) / 20;
}

/**
 * Computes EPF (KWSP) employee & employer contributions per Malaysian statutory rules:
 * - Citizens/PR < 60: Third Schedule Part A (RM20 bands up to RM5,000 -> 11%/13%; RM100 bands RM5,000.01-RM20,000 -> 11%/12%; >RM20,000 exact), rounded up to next RM1.
 * - Citizens/PR >= 60: Part E (0% employee mandatory, 4% employer).
 * - Foreign workers (mandatory Oct 2025): Part F (2% employee + 2% employer on actual wages, each rounded up to next RM1).
 */
export function calculateEpfContributions(
  wagesRm: number,
  citizenship: "citizen" | "foreign",
  ageGroup: "under_60" | "60_plus"
): { employeeRm: number; employerRm: number } {
  if (wagesRm <= 10) {
    return { employeeRm: 0, employerRm: 0 };
  }

  if (citizenship === "foreign") {
    return {
      employeeRm: Math.ceil(wagesRm * STATUTORY_CONSTANTS_2026.epfForeignWorkerRate),
      employerRm: Math.ceil(wagesRm * STATUTORY_CONSTANTS_2026.epfForeignWorkerRate),
    };
  }

  // Citizen / PR wage bracket upper limit per Third Schedule
  let bracketUpper = wagesRm;
  if (wagesRm <= 20) {
    bracketUpper = 20;
  } else if (wagesRm <= 5000) {
    bracketUpper = Math.ceil(wagesRm / 20) * 20;
  } else if (wagesRm <= 20000) {
    bracketUpper = Math.ceil(wagesRm / 100) * 100;
  }

  if (ageGroup === "60_plus") {
    return {
      employeeRm: 0,
      employerRm: Math.ceil(bracketUpper * 0.04),
    };
  }

  const employerRate = wagesRm <= 5000 ? 0.13 : 0.12;
  return {
    employeeRm: Math.ceil(bracketUpper * 0.11),
    employerRm: Math.ceil(bracketUpper * employerRate),
  };
}

/**
 * Computes PERKESO (SOCSO) and EIS contributions using RM100 midpoint wage brackets up to RM6,000 ceiling.
 */
export function calculateSocsoAndEis(
  wagesRm: number,
  citizenship: "citizen" | "foreign",
  ageGroup: "under_60" | "60_plus"
): {
  socsoEmployeeRm: number;
  socsoEmployerRm: number;
  eisEmployeeRm: number;
  eisEmployerRm: number;
} {
  if (wagesRm <= 0) {
    return {
      socsoEmployeeRm: 0,
      socsoEmployerRm: 0,
      eisEmployeeRm: 0,
      eisEmployerRm: 0,
    };
  }

  const cappedWage = Math.min(wagesRm, STATUTORY_CONSTANTS_2026.socsoCeilingRm);
  // Midpoint of RM100 bracket (e.g. 5900.01-6000 -> 5950; 1700.01-1800 -> 1750)
  const bracketIndex = Math.max(1, Math.ceil(cappedWage / 100));
  const midpoint = bracketIndex * 100 - 50;

  if (citizenship === "foreign" || ageGroup === "60_plus") {
    // Category 2 (Employment Injury only: 1.25% employer, 0% employee; EIS exempt)
    return {
      socsoEmployeeRm: 0,
      socsoEmployerRm: roundToNearestFiveSen(midpoint * 0.0125),
      eisEmployeeRm: 0,
      eisEmployerRm: 0,
    };
  }

  return {
    socsoEmployeeRm: roundToNearestFiveSen(midpoint * 0.005),
    socsoEmployerRm: roundToNearestFiveSen(midpoint * 0.0175),
    eisEmployeeRm: roundToNearestFiveSen(midpoint * 0.002),
    eisEmployerRm: roundToNearestFiveSen(midpoint * 0.002),
  };
}

/**
 * Computes PERKESO Lindung 24 Jam (SKBBK) employee-borne Phase 1 (0.75% up to RM6,000 ceiling).
 * Mandatory for foreign workers; optional (opt-out allowed) for Malaysian citizens.
 */
export function calculateLindung24Jam(
  wagesRm: number,
  citizenship: "citizen" | "foreign",
  optOut: boolean
): number {
  if (wagesRm <= 0) return 0;
  if (citizenship === "citizen" && optOut) return 0;
  const capped = Math.min(wagesRm, STATUTORY_CONSTANTS_2026.socsoCeilingRm);
  return roundToNearestFiveSen(capped * STATUTORY_CONSTANTS_2026.lindung24JamPhase1Rate);
}

/**
 * Runs a complete deterministic statutory audit for one employee (for both SME pre-payroll check & worker payslip verification).
 */
export function auditEmployeePayroll(
  input: PayrollEmployeeInput
): PayrollEmployeeAudit {
  const dailyHours = Math.min(
    Math.max(1, input.normalDailyHours || 8),
    STATUTORY_CONSTANTS_2026.ea1955MaxDailyHours
  );

  const effectiveBasicFloor = Math.max(
    input.basicSalaryRm,
    STATUTORY_CONSTANTS_2026.minimumWageRm
  );

  // Employment Act 1955 s.60I ORP & HRP based on proper basic wage (at least RM1,700)
  const orpRm = round2(effectiveBasicFloor / STATUTORY_CONSTANTS_2026.ea1955StandardMonthDays);
  const hrpRm = round2(orpRm / dailyHours);

  const normalOtPay = round2(input.normalOtHours * hrpRm * 1.5);
  const restDayOtPay = round2(input.restDayHours * hrpRm * 2.0);
  const publicHolidayOtPay = round2(input.publicHolidayHours * hrpRm * 3.0);
  const expectedOtPayRm = round2(normalOtPay + restDayOtPay + publicHolidayOtPay);

  // Statutory wages for EPF/PERKESO include basic, fixed allowances, commissions, and rest/PH pay (standard OT excluded from EPF wages)
  const epfEligibleWagesRm = round2(
    effectiveBasicFloor + input.fixedAllowanceRm + input.commissionOrBonusRm
  );
  const socsoEligibleWagesRm = round2(
    effectiveBasicFloor + input.fixedAllowanceRm + input.commissionOrBonusRm + expectedOtPayRm
  );

  const epf = calculateEpfContributions(
    epfEligibleWagesRm,
    input.citizenship,
    input.ageGroup
  );
  const socsoEis = calculateSocsoAndEis(
    socsoEligibleWagesRm,
    input.citizenship,
    input.ageGroup
  );
  const expectedLindung24Jam = calculateLindung24Jam(
    socsoEligibleWagesRm,
    input.citizenship,
    input.lindung24JamOptOut
  );

  const grossStatutoryWagesRm = round2(
    effectiveBasicFloor +
      input.fixedAllowanceRm +
      input.commissionOrBonusRm +
      expectedOtPayRm
  );

  const totalExpectedEmployeeDeductions = round2(
    epf.employeeRm +
      socsoEis.socsoEmployeeRm +
      socsoEis.eisEmployeeRm +
      expectedLindung24Jam
  );
  const expectedNetPayRm = round2(grossStatutoryWagesRm - totalExpectedEmployeeDeductions);
  const totalEmployerCostRm = round2(
    grossStatutoryWagesRm +
      epf.employerRm +
      socsoEis.socsoEmployerRm +
      socsoEis.eisEmployerRm
  );

  const findings: AuditFinding[] = [];
  let totalShortfallOrVarianceRm = 0;

  // 1. Minimum wage floor check (basic salary strictly excluding allowances)
  if (input.basicSalaryRm < STATUTORY_CONSTANTS_2026.minimumWageRm) {
    const gap = round2(STATUTORY_CONSTANTS_2026.minimumWageRm - input.basicSalaryRm);
    totalShortfallOrVarianceRm = round2(totalShortfallOrVarianceRm + gap);
    findings.push({
      code: "MIN_WAGE_BELOW_1700",
      severity: "action_needed",
      titleEn: `Basic salary (RM${input.basicSalaryRm.toFixed(2)}) is below the RM1,700 minimum basic floor`,
      titleBm: `Gaji pokok (RM${input.basicSalaryRm.toFixed(2)}) berada di bawah paras minimum RM1,700`,
      detailEn: `Fixed allowances (RM${input.fixedAllowanceRm.toFixed(2)}) cannot be counted toward the RM1,700 statutory basic minimum. Adjust basic salary up by RM${gap.toFixed(2)}.`,
      detailBm: `Elaun tetap (RM${input.fixedAllowanceRm.toFixed(2)}) tidak boleh dikira untuk mencukupkan gaji pokok minimum RM1,700. Laraskan gaji pokok sebanyak RM${gap.toFixed(2)}.`,
      varianceRm: gap,
      citation: CITATIONS.MIN_WAGE_1700,
    });
  } else {
    findings.push({
      code: "MIN_WAGE_COMPLIANT",
      severity: "pass",
      titleEn: "Basic salary meets the RM1,700 statutory floor",
      titleBm: "Gaji pokok mematuhi paras minimum RM1,700",
      detailEn: `Basic salary is RM${input.basicSalaryRm.toFixed(2)} excluding allowances.`,
      detailBm: `Gaji pokok ialah RM${input.basicSalaryRm.toFixed(2)} tidak termasuk elaun.`,
      varianceRm: 0,
      citation: CITATIONS.MIN_WAGE_1700,
    });
  }

  // Compare declared payslip values if provided (worker payslip check or SME audit)
  if (input.declaredPayslip) {
    const d = input.declaredPayslip;

    // 2. Overtime comparison
    if (expectedOtPayRm > 0 && Math.abs(d.otPaidRm - expectedOtPayRm) > 0.05) {
      const otGap = round2(expectedOtPayRm - d.otPaidRm);
      if (otGap > 0) totalShortfallOrVarianceRm = round2(totalShortfallOrVarianceRm + otGap);
      findings.push({
        code: "OT_VARIANCE",
        severity: otGap > 0 ? "action_needed" : "warning",
        titleEn: `Overtime calculation differs by RM${Math.abs(otGap).toFixed(2)}`,
        titleBm: `Kiraan kerja lebih masa berbeza sebanyak RM${Math.abs(otGap).toFixed(2)}`,
        detailEn: `Using HRP RM${hrpRm.toFixed(2)}/hr (ORP RM${orpRm.toFixed(2)}/day), statutory OT is RM${expectedOtPayRm.toFixed(2)} vs RM${d.otPaidRm.toFixed(2)} recorded on payslip.`,
        detailBm: `Menggunakan KBJ RM${hrpRm.toFixed(2)}/jam (KGB RM${orpRm.toFixed(2)}/hari), OT statutori ialah RM${expectedOtPayRm.toFixed(2)} berbanding RM${d.otPaidRm.toFixed(2)} pada slip gaji.`,
        varianceRm: Math.max(0, otGap),
        citation: CITATIONS.EA_1955_OVERTIME,
      });
    }

    // 3. EPF employee & employer comparison (especially foreign-worker 2% check)
    const epfEmployerGap = round2(epf.employerRm - d.epfEmployerContributedRm);
    const epfEmployeeGap = round2(epf.employeeRm - d.epfEmployeeDeductedRm);
    if (Math.abs(epfEmployerGap) >= 1 || Math.abs(epfEmployeeGap) >= 1) {
      const positiveMissingEmployer = Math.max(0, epfEmployerGap);
      totalShortfallOrVarianceRm = round2(
        totalShortfallOrVarianceRm + positiveMissingEmployer
      );
      findings.push({
        code:
          input.citizenship === "foreign" ? "EPF_FOREIGN_VARIANCE" : "EPF_VARIANCE",
        severity: positiveMissingEmployer > 0 ? "action_needed" : "warning",
        titleEn:
          input.citizenship === "foreign"
            ? `Mandatory 2% foreign-worker EPF mismatch (Expected RM${epf.employeeRm}/RM${epf.employerRm})`
            : `EPF Third Schedule variance (Expected EE RM${epf.employeeRm} / ER RM${epf.employerRm})`,
        titleBm:
          input.citizenship === "foreign"
            ? `Ketidakpadanan KWSP wajib 2% pekerja asing (Jangkaan RM${epf.employeeRm}/RM${epf.employerRm})`
            : `Perbezaan Jadual Ketiga KWSP (Jangkaan Pekerja RM${epf.employeeRm} / Majikan RM${epf.employerRm})`,
        detailEn: `Recorded EE RM${d.epfEmployeeDeductedRm.toFixed(2)} / ER RM${d.epfEmployerContributedRm.toFixed(2)}. Statutory expectation is EE RM${epf.employeeRm.toFixed(2)} / ER RM${epf.employerRm.toFixed(2)}.`,
        detailBm: `Direkodkan Pekerja RM${d.epfEmployeeDeductedRm.toFixed(2)} / Majikan RM${d.epfEmployerContributedRm.toFixed(2)}. Jangkaan statutori ialah Pekerja RM${epf.employeeRm.toFixed(2)} / Majikan RM${epf.employerRm.toFixed(2)}.`,
        varianceRm: Math.max(0, epfEmployerGap) + Math.max(0, Math.abs(epfEmployeeGap)),
        citation:
          input.citizenship === "foreign"
            ? CITATIONS.EPF_FOREIGN_2PCT
            : CITATIONS.EPF_THIRD_SCHEDULE,
      });
    }

    // 4. Lindung 24 Jam (SKBBK) check
    if (Math.abs(d.lindung24JamDeductedRm - expectedLindung24Jam) > 0.05) {
      const lindungVariance = round2(
        Math.abs(d.lindung24JamDeductedRm - expectedLindung24Jam)
      );
      if (d.lindung24JamDeductedRm > expectedLindung24Jam) {
        totalShortfallOrVarianceRm = round2(
          totalShortfallOrVarianceRm + lindungVariance
        );
      }
      findings.push({
        code: "LINDUNG_24JAM_MISMATCH",
        severity:
          input.citizenship === "citizen" && input.lindung24JamOptOut
            ? "action_needed"
            : "warning",
        titleEn:
          input.citizenship === "citizen" && input.lindung24JamOptOut
            ? `Lindung 24 Jam deducted (RM${d.lindung24JamDeductedRm.toFixed(2)}) despite citizen opt-out`
            : `PERKESO Lindung 24 Jam (0.75%) contribution variance (RM${lindungVariance.toFixed(2)})`,
        titleBm:
          input.citizenship === "citizen" && input.lindung24JamOptOut
            ? `Potongan Lindung 24 Jam (RM${d.lindung24JamDeductedRm.toFixed(2)}) walaupun pekerja memilih keluar`
            : `Perbezaan caruman PERKESO Lindung 24 Jam (0.75%) sebanyak RM${lindungVariance.toFixed(2)}`,
        detailEn:
          input.citizenship === "foreign"
            ? `Foreign workers require mandatory 0.75% Lindung 24 Jam (RM${expectedLindung24Jam.toFixed(2)}).`
            : `Citizens who opted out should have RM0.00 deducted; otherwise 0.75% up to RM6,000 ceiling applies.`,
        detailBm:
          input.citizenship === "foreign"
            ? `Pekerja asing wajib mencarum 0.75% Lindung 24 Jam (RM${expectedLindung24Jam.toFixed(2)}).`
            : `Warganegara yang memilih keluar perlu RM0.00 potongan; jika kekal aktif, kadar 0.75% sehingga siling RM6,000 terpakai.`,
        varianceRm: lindungVariance,
        citation: CITATIONS.LINDUNG_24_JAM,
      });
    }

    // 5. SOCSO / EIS check
    const socsoEmployerGap = round2(
      socsoEis.socsoEmployerRm - d.socsoEmployerContributedRm
    );
    const eisEmployerGap = round2(socsoEis.eisEmployerRm - d.eisEmployerContributedRm);
    if (Math.abs(socsoEmployerGap) > 0.1 || Math.abs(eisEmployerGap) > 0.1) {
      findings.push({
        code: "SOCSO_EIS_VARIANCE",
        severity: "warning",
        titleEn: "PERKESO / EIS bracket variance detected",
        titleBm: "Perbezaan julat PERKESO / SIP (EIS) dikesan",
        detailEn: `Expected SOCSO EE RM${socsoEis.socsoEmployeeRm.toFixed(2)} / ER RM${socsoEis.socsoEmployerRm.toFixed(2)} and EIS EE RM${socsoEis.eisEmployeeRm.toFixed(2)} / ER RM${socsoEis.eisEmployerRm.toFixed(2)}.`,
        detailBm: `Jangkaan PERKESO Pekerja RM${socsoEis.socsoEmployeeRm.toFixed(2)} / Majikan RM${socsoEis.socsoEmployerRm.toFixed(2)} dan SIP Pekerja RM${socsoEis.eisEmployeeRm.toFixed(2)} / Majikan RM${socsoEis.eisEmployerRm.toFixed(2)}.`,
        varianceRm: round2(Math.abs(socsoEmployerGap) + Math.abs(eisEmployerGap)),
        citation: CITATIONS.PERKESO_SOCSO_EIS,
      });
    }
  } else {
    // Pre-payday advisory check (for SME setting up clean payroll)
    findings.push({
      code: "PRE_PAYROLL_STATUTORY_READY",
      severity: "info",
      titleEn: `Statutory schedule computed cleanly (ER Cost RM${totalEmployerCostRm.toFixed(2)})`,
      titleBm: `Jadual statutori dikira tepat (Kos Majikan RM${totalEmployerCostRm.toFixed(2)})`,
      detailEn: `Ready for KWSP Borang A (RM${(epf.employeeRm + epf.employerRm).toFixed(2)}) & PERKESO Borang 8A (RM${(socsoEis.socsoEmployeeRm + socsoEis.socsoEmployerRm + socsoEis.eisEmployeeRm + socsoEis.eisEmployerRm + expectedLindung24Jam).toFixed(2)}).`,
      detailBm: `Sedia untuk Borang A KWSP (RM${(epf.employeeRm + epf.employerRm).toFixed(2)}) & Borang 8A PERKESO (RM${(socsoEis.socsoEmployeeRm + socsoEis.socsoEmployerRm + socsoEis.eisEmployeeRm + socsoEis.eisEmployerRm + expectedLindung24Jam).toFixed(2)}).`,
      varianceRm: 0,
      citation:
        input.citizenship === "foreign"
          ? CITATIONS.EPF_FOREIGN_2PCT
          : CITATIONS.PERKESO_SOCSO_EIS,
    });
  }

  const penaltyDeduction = findings.reduce(
    (acc, f) =>
      acc + (f.severity === "action_needed" ? 28 : f.severity === "warning" ? 12 : 0),
    0
  );
  const complianceScore = Math.max(0, 100 - penaltyDeduction);

  return {
    employeeId: input.id,
    employeeName: input.name,
    citizenship: input.citizenship,
    grossStatutoryWagesRm,
    orpRm,
    hrpRm,
    expected: {
      basicSalaryRm: effectiveBasicFloor,
      allowanceRm: round2(input.fixedAllowanceRm + input.commissionOrBonusRm),
      otPayRm: expectedOtPayRm,
      epfEmployeeRm: epf.employeeRm,
      epfEmployerRm: epf.employerRm,
      socsoEmployeeRm: socsoEis.socsoEmployeeRm,
      socsoEmployerRm: socsoEis.socsoEmployerRm,
      eisEmployeeRm: socsoEis.eisEmployeeRm,
      eisEmployerRm: socsoEis.eisEmployerRm,
      lindung24JamEmployeeRm: expectedLindung24Jam,
      netPayRm: expectedNetPayRm,
      totalEmployerCostRm,
    },
    findings,
    totalShortfallOrVarianceRm,
    complianceScore,
  };
}
