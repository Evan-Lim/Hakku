import { describe, expect, it } from "vitest";
import { runAgent } from "@/lib/agent/runAgent";
import { classifyCase, detectLanguage, extractFacts, guardFactsAgainstText } from "@/lib/agent/understand";
import { checkAmountsPreserved } from "@/lib/agent/report";
import { auditPartTimePay } from "@/lib/engines/partTimeEngine";

const NOW = new Date("2026-12-03T10:00:00+08:00");

describe("understand", () => {
  it("detects language", () => {
    expect(detectLanguage("Bos saya tak bayar OT")).toBe("ms");
    expect(detectLanguage("老板没给我加班费")).toBe("zh");
    expect(detectLanguage("என் சம்பளம் குறைவு")).toBe("ta");
    expect(detectLanguage("My boss underpaid my overtime")).toBe("en");
  });
  it("classifies cases", () => {
    expect(classifyCase("part-time cafe RM7.50 sejam")).toBe("part_time");
    expect(classifyCase("Grab suspend akaun saya 19 hari")).toBe("gig_rider");
    expect(classifyCase("client tak bayar invois RM2800")).toBe("freelancer");
    expect(classifyCase("gaji pokok RM1800, OT tak bayar")).toBe("employee");
  });
  it("drops numbers the user never typed", () => {
    expect(guardFactsAgainstText({ basicSalaryRm: 1800, otHours: 99 }, "gaji RM1,800")).toEqual({ basicSalaryRm: 1800 });
  });
});

describe("runAgent", () => {
  it("asks follow-up questions in the user's language when facts are missing", () => {
    const r = runAgent({ message: "老板没给我加班费" }, NOW);
    expect(r.language).toBe("zh");
    expect(r.questions.length).toBeGreaterThan(0);
    expect(r.report).toBeNull();
    expect(r.handoff).toBeNull();
  });

  it("part-time: one prompt to a formal BM report and WFW fill plan", () => {
    const r = runAgent({ message: "I work part-time at a cafe, RM7.50 an hour, 80 hours this month, boss sets my shifts" }, NOW);
    expect(r.caseType).toBe("part_time");
    expect(r.totalRm).toBe(97.6);
    expect(r.report?.perkara).toMatch(/Gaji Minimum/);
    expect(r.report?.body).toContain("RM97.60");
    expect(r.portals[0].portalId).toBe("wfw");
    expect(r.portals[0].fields.find((f) => f.key === "icNumber")?.filledBy).toBe("user");
    expect(r.handoff?.userMust).toEqual(["login", "review", "submit"]);
  });

  it("gig rider: suspension allowance from the engine", () => {
    const r = runAgent({ message: "Grab gantung akaun saya 19 hari, purata RM110 sehari" }, NOW);
    expect(r.caseType).toBe("gig_rider");
    expect(r.totalRm).toBe(1045);
    expect(r.portals[0].portalId).toBe("gig_eaduan");
  });

  it("freelancer: overdue invoice", () => {
    const r = runAgent({ message: "Klien tak bayar invois RM2,800, kerja siap 45 hari lalu" }, NOW);
    expect(r.totalRm).toBe(2800);
  });

  it("report amounts guard", () => {
    expect(checkAmountsPreserved("Jumlah RM97.60.", [97.6])).toBe(true);
    expect(checkAmountsPreserved("Jumlah RM100.00.", [97.6])).toBe(false);
  });
});

describe("partTimeEngine", () => {
  it("computes shortfall against RM8.72/hour", () => {
    expect(auditPartTimePay({ hourlyRateRm: 7.5, hoursThisMonth: 80, bossSetsShifts: true, epfDeducted: false }).shortfallRm).toBe(97.6);
  });
});
