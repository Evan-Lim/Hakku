import { describe, expect, it } from "vitest";
import {
  auditEmployeePayroll,
  calculateEpfContributions,
  calculateLindung24Jam,
  calculateSocsoAndEis,
} from "@/lib/engines/payrollEngine";
import { auditGigCase } from "@/lib/engines/gigEngine";
import { calculateStampDuty2026 } from "@/lib/engines/stampDutyEngine";

describe("Malaysian 2026 Payroll Statutory Engine", () => {
  it("computes EPF Third Schedule for citizens and mandatory 2% rounded up for foreign workers", () => {
    expect(calculateEpfContributions(1700, "citizen", "under_60")).toEqual({
      employeeRm: 187,
      employerRm: 221,
    });
    expect(calculateEpfContributions(5500, "citizen", "under_60")).toEqual({
      employeeRm: 605,
      employerRm: 660,
    });
    // Foreign worker RM1,751 * 2% = RM35.02 -> rounded up to RM36 each
    expect(calculateEpfContributions(1751, "foreign", "under_60")).toEqual({
      employeeRm: 36,
      employerRm: 36,
    });
  });

  it("caps PERKESO & EIS at RM6,000 ceiling matching official statutory maxima", () => {
    expect(calculateSocsoAndEis(7200, "citizen", "under_60")).toEqual({
      socsoEmployeeRm: 29.75,
      socsoEmployerRm: 104.15,
      eisEmployeeRm: 11.9,
      eisEmployerRm: 11.9,
    });
  });

  it("enforces mandatory Lindung 24 Jam (0.75%) for foreign workers and allows citizen opt-out", () => {
    expect(calculateLindung24Jam(2000, "citizen", true)).toBe(0);
    expect(calculateLindung24Jam(2000, "foreign", true)).toBe(15);
    expect(calculateLindung24Jam(8000, "foreign", false)).toBe(45);
  });

  it("flags RM1,650 basic + allowance shortfall, OT variance, and improper Lindung 24 Jam deduction", () => {
    const audit = auditEmployeePayroll({
      id: "w1",
      name: "Aina",
      citizenship: "citizen",
      ageGroup: "under_60",
      basicSalaryRm: 1650,
      fixedAllowanceRm: 250,
      commissionOrBonusRm: 0,
      normalDailyHours: 8,
      normalOtHours: 16,
      restDayHours: 0,
      publicHolidayHours: 0,
      lindung24JamOptOut: true,
      declaredPayslip: {
        basicPaidRm: 1650,
        allowancePaidRm: 250,
        otPaidRm: 140,
        epfEmployeeDeductedRm: 209,
        epfEmployerContributedRm: 247,
        socsoEmployeeDeductedRm: 9.75,
        socsoEmployerContributedRm: 34.15,
        eisEmployeeDeductedRm: 3.9,
        eisEmployerContributedRm: 3.9,
        lindung24JamDeductedRm: 15.4,
        netPaidRm: 1801.95,
      },
    });

    const codes = audit.findings.map((f) => f.code);
    expect(codes).toContain("MIN_WAGE_BELOW_1700");
    expect(codes).toContain("OT_VARIANCE");
    expect(codes).toContain("LINDUNG_24JAM_MISMATCH");
    expect(audit.totalShortfallOrVarianceRm).toBeGreaterThan(100);
  });
});

describe("Gig Workers Act 2025 (Act 872) Engine", () => {
  it("flags overdue >7-day payout, >14-day suspension cap, 50% back-pay, and 1.25% SKSPS", () => {
    const result = auditGigCase({
      workerName: "Kumar",
      roleType: "gig_rider",
      platformOrClientName: "KilatGo",
      hasWrittenAgreement: true,
      statesFeeFormula: true,
      statesPaymentTimeline: true,
      statesSuspensionProcess: false,
      invoiceOrPayoutAmountRm: 640,
      daysSinceWorkCompleted: 11,
      isSuspended: true,
      suspensionDaysElapsed: 19,
      averageDailyEarningsRm: 110,
      backPayPaidRm: 0,
      platformSkspsDeductedRm: 34.5,
      monthlyGrossGigIncomeRm: 2760,
      annualISaraanContributedRm: 600,
    });

    expect(result.isPayoutOverdue).toBe(true);
    expect(result.daysOverdue).toBe(4);
    expect(result.isSuspensionCapBreached).toBe(true);
    expect(result.expectedBackPayRm).toBe(1045); // 19 * 110 * 50%
    expect(result.totalClaimableRm).toBe(1685); // 640 + 1045
    expect(result.expectedSksps125Rm).toBe(34.5);
    expect(result.estimatedISaraanMatchRm).toBe(120); // 600 * 20%
  });
});

describe("2026 MyTax e-Duti Setem Engine", () => {
  it("exempts employment contracts <= RM3,000 and charges RM10 above RM3,000 (Item 4)", () => {
    const exempt = calculateStampDuty2026({
      instrumentType: "employment_contract",
      monthlyWageOrRentRm: 3000,
      tenancyYears: 1,
      duplicateCopies: 0,
      signedDaysAgo: 10,
      alreadyStamped: false,
    });
    expect(exempt.isExempt).toBe(true);
    expect(exempt.totalStampDutyRm).toBe(0);

    const taxable = calculateStampDuty2026({
      instrumentType: "employment_contract",
      monthlyWageOrRentRm: 3800,
      tenancyYears: 1,
      duplicateCopies: 1,
      signedDaysAgo: 10,
      alreadyStamped: false,
    });
    expect(taxable.isExempt).toBe(false);
    expect(taxable.principalDutyRm).toBe(10);
    expect(taxable.totalStampDutyRm).toBe(20);
  });

  it("calculates Item 49(a) on full annual rent without RM2,400 exemption and flags PKPS", () => {
    // RM4,500/mo = RM54,000/yr -> 216 blocks of RM250; 2-year lease = RM3/block = RM648 + RM10 copy
    const lease = calculateStampDuty2026({
      instrumentType: "tenancy_workspace",
      monthlyWageOrRentRm: 4500,
      tenancyYears: 2,
      duplicateCopies: 1,
      signedDaysAgo: 45,
      alreadyStamped: false,
    });
    expect(lease.principalDutyRm).toBe(648);
    expect(lease.totalStampDutyRm).toBe(658);
    expect(lease.pkpsAmnestyEligible).toBe(true);
  });
});
