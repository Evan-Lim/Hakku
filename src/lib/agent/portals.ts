// Step 4 + 6: route the case to the right agency and build a field-by-field fill plan.
// Hakku fills only case data. Identity fields (IC, phone, address) are "user": the user
// enters them after logging in with their own credentials — Hakku never stores or types them.

import type { AgentCaseType, FormalBmReport, PortalFillPlan, PortalId } from "./types";

const BM_MONTHS = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
export const rmText = (n: number) => "RM" + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PORTALS: Record<PortalId, { agencyMs: string; agencyEn: string; officialUrl: string; mirrorPath: string }> = {
  wfw: { agencyMs: "JTKSM · Working for Workers", agencyEn: "Labour Department (JTKSM) · Working for Workers", officialUrl: "https://www.workforworkers.com.my/", mirrorPath: "/portals/kesuma" },
  gig_eaduan: { agencyMs: "JTKSM · e-Aduan Pekerja Gig", agencyEn: "Labour Department (JTKSM) · Gig worker e-Aduan", officialUrl: "https://eaduan-gig.mohr.gov.my/", mirrorPath: "/portals/kesuma" },
  mytax: { agencyMs: "LHDN · MyTax e-Duti Setem", agencyEn: "Inland Revenue (LHDN) · MyTax e-Duti Setem", officialUrl: "https://mytax.hasil.gov.my", mirrorPath: "/portals/mytax" },
  kwsp: { agencyMs: "KWSP · i-Akaun Majikan", agencyEn: "EPF (KWSP) · Employer i-Akaun", officialUrl: "https://www.kwsp.gov.my", mirrorPath: "/portals/kwsp" },
};

const MIRROR_PREFIX: Record<PortalId, string> = { wfw: "WFW", gig_eaduan: "GIG", mytax: "STM", kwsp: "KWSP" };

/** Simulated reference from a Hakku portal mirror (demo only — never a real agency reference). */
export function mirrorReference(portalId: PortalId, now: Date = new Date()) {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return {
    target: "mirror" as const,
    referenceNo: `HAKKU-${MIRROR_PREFIX[portalId]}-${now.getFullYear()}-${rand}`,
    submittedAt: now.toISOString(),
    noticeMs: "Ini rujukan simulasi daripada portal cermin Hakku, bukan rujukan rasmi agensi.",
  };
}

export function routeAgencies(caseType: AgentCaseType): PortalId[] {
  switch (caseType) {
    case "employee":
    case "part_time":
      return ["wfw"];
    case "gig_rider":
    case "freelancer":
      return ["gig_eaduan"];
    case "sme":
      return ["kwsp", "mytax"];
  }
}

export function buildFillPlan(params: {
  portalId: PortalId;
  caseType: AgentCaseType;
  counterparty: string;
  categoryMs: string;
  totalRm: number;
  report: FormalBmReport;
  now: Date;
}): PortalFillPlan {
  const { portalId, caseType, counterparty, categoryMs, totalRm, report, now } = params;
  const p = PORTALS[portalId];
  const month = `${BM_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const user = (key: string, labelMs: string) => ({ key, labelMs, value: "", filledBy: "user" as const });
  const agent = (key: string, labelMs: string, value: string) => ({ key, labelMs, value, filledBy: "agent" as const });

  const fields =
    portalId === "wfw"
      ? [
          user("complainantName", "Nama pengadu"),
          user("icNumber", "No. Kad Pengenalan"),
          user("phone", "No. telefon"),
          agent("employerName", "Nama majikan", counterparty),
          user("workplaceAddress", "Alamat tempat kerja"),
          agent("category", "Kategori aduan", categoryMs),
          agent("period", "Bulan berkaitan", month),
          agent("amount", "Jumlah dituntut", rmText(totalRm)),
          agent("description", "Keterangan aduan", report.body),
          user("declaration", "Pengakuan maklumat adalah benar"),
        ]
      : portalId === "gig_eaduan"
        ? [
            user("complainantName", "Nama pengadu"),
            user("icNumber", "No. Kad Pengenalan"),
            user("phone", "No. telefon"),
            agent("workerType", "Jenis pekerja gig", caseType === "gig_rider" ? "Penghantar / p-hailing" : "Pekerja bebas (freelance)"),
            agent("counterparty", "Nama platform / entiti berkontrak", counterparty),
            agent("category", "Kategori aduan", categoryMs),
            agent("amount", "Jumlah dituntut", rmText(totalRm)),
            agent("description", "Keterangan aduan", report.body),
            user("declaration", "Pengakuan maklumat adalah benar"),
          ]
        : [
            user("employerId", "No. majikan / No. cukai"),
            agent("category", "Perkara", categoryMs),
            agent("amount", "Jumlah", rmText(totalRm)),
            agent("description", "Catatan", report.body),
          ];

  return {
    portalId,
    agencyMs: p.agencyMs,
    agencyEn: p.agencyEn,
    officialUrl: p.officialUrl,
    mirrorPath: p.mirrorPath,
    fields,
    attachments: report.lampiran,
    fieldMapVerified: false,
  };
}
