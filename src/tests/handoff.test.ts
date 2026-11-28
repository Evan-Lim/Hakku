import { describe, expect, it } from "vitest";
import { runAgent } from "@/lib/agent/runAgent";
import {
  buildGmailComposeUrl,
  buildJtksmReportPack,
  buildMailtoUrl,
  buildWhatsAppShareUrl,
  isValidEmail,
  missingUserFields,
} from "@/lib/agent/handoff";

const NOW = new Date("2026-12-03T10:00:00+08:00");

describe("email hand-off", () => {
  it("validates addresses", () => {
    expect(isValidEmail("hr@seri.com.my")).toBe(true);
    expect(isValidEmail("hr@seri")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("builds a Gmail compose link with everything filled in", () => {
    const url = buildGmailComposeUrl({ to: "hr@seri.com.my", subject: "Gaji November", body: "Line 1\nRM56.08 & more" });
    expect(url).not.toBeNull();
    const u = new URL(url!);
    expect(u.origin + u.pathname).toBe("https://mail.google.com/mail/");
    expect(u.searchParams.get("view")).toBe("cm");
    expect(u.searchParams.get("to")).toBe("hr@seri.com.my");
    expect(u.searchParams.get("su")).toBe("Gaji November");
    expect(u.searchParams.get("body")).toBe("Line 1\nRM56.08 & more");
  });

  it("refuses to build links without a valid address", () => {
    expect(buildGmailComposeUrl({ to: "nope", subject: "", body: "" })).toBeNull();
    expect(buildMailtoUrl({ to: "nope", subject: "", body: "" })).toBeNull();
  });

  it("encodes WhatsApp text", () => {
    expect(buildWhatsAppShareUrl("Hai bos & RM97.60")).toBe("https://wa.me/?text=Hai%20bos%20%26%20RM97.60");
  });
});

describe("JTKSM report pack", () => {
  it("is built from an agent result with identity fields left to the user", () => {
    const res = runAgent({ message: "part-time RM7.50 sejam, 80 jam bulan ni, bos atur syif" }, NOW);
    const pack = buildJtksmReportPack(res, NOW);
    expect(pack).not.toBeNull();
    expect(pack!.portalId).toBe("wfw");
    expect(pack!.officialUrl).toBe("https://www.workforworkers.com.my/");
    expect(pack!.fields.find((f) => f.key === "amount")?.value).toBe("RM97.60");
    expect(pack!.fields.find((f) => f.key === "description")?.value).toContain("RM97.60");
    expect(missingUserFields(pack!.fields).map((f) => f.key)).toEqual(["complainantName", "icNumber", "phone", "workplaceAddress"]);
  });

  it("is null when the agent still needs answers", () => {
    expect(buildJtksmReportPack(runAgent({ message: "老板没给我加班费" }, NOW), NOW)).toBeNull();
  });
});
