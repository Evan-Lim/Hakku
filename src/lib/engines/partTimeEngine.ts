// Part-time / hourly-paid minimum wage check.
// Deterministic: the LLM never calculates money (AGENTS.md §3).
// Source: Minimum Wages Order 2024 [P.U.(A) 376/2024] — hourly-rated workers RM8.72/hour.

export const MIN_HOURLY_WAGE_2026_RM = 8.72;

export interface PartTimeInput {
  hourlyRateRm: number;
  hoursThisMonth: number;
  bossSetsShifts: boolean;
  epfDeducted: boolean;
}

export interface PartTimeResult {
  minimumHourlyRm: number;
  hourlyShortfallRm: number;
  paidRm: number;
  minimumDueRm: number;
  shortfallRm: number;
  isBelowMinimum: boolean;
  likelyEmployee: boolean;
  missingStatutoryContributions: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function auditPartTimePay(input: PartTimeInput): PartTimeResult {
  const hours = Math.max(0, input.hoursThisMonth);
  const rate = Math.max(0, input.hourlyRateRm);
  const paid = round2(rate * hours);
  const minimumDue = round2(MIN_HOURLY_WAGE_2026_RM * hours);
  const hourlyShortfall = round2(Math.max(0, MIN_HOURLY_WAGE_2026_RM - rate));
  return {
    minimumHourlyRm: MIN_HOURLY_WAGE_2026_RM,
    hourlyShortfallRm: hourlyShortfall,
    paidRm: paid,
    minimumDueRm: minimumDue,
    shortfallRm: round2(hourlyShortfall * hours),
    isBelowMinimum: rate < MIN_HOURLY_WAGE_2026_RM,
    likelyEmployee: input.bossSetsShifts,
    missingStatutoryContributions: input.bossSetsShifts && !input.epfDeducted,
  };
}
