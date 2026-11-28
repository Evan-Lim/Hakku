// Step 5: formal Bahasa Melayu report. The template is always correct on its own;
// live mode may ask ILMU to polish it, but the polish is only accepted if every
// ringgit amount is unchanged (checkAmountsPreserved).

import type { AgentCaseType, AgentFinding, FormalBmReport } from "./types";
import { rmText } from "./portals";

const PERKARA: Record<AgentCaseType, string> = {
  employee: "Aduan Gaji Tidak Dibayar Mengikut Akta Kerja 1955 dan Perintah Gaji Minimum 2024",
  part_time: "Aduan Kadar Gaji Sejam di Bawah Kadar Minimum (Perintah Gaji Minimum 2024)",
  gig_rider: "Aduan Penggantungan Akaun dan Bayaran Pendapatan di Bawah Akta Pekerja Gig 2025 (Akta 872)",
  freelancer: "Aduan Bayaran Pendapatan Tertunggak di Bawah Akta Pekerja Gig 2025 (Akta 872)",
  sme: "Pembetulan Caruman dan Penyeteman Sebelum Pembayaran Gaji",
};

const LAMPIRAN: Record<AgentCaseType, string[]> = {
  employee: ["Salinan slip gaji", "Rekod kehadiran / kerja lebih masa", "Surat tawaran atau kontrak pekerjaan", "Laporan kiraan Hakku"],
  part_time: ["Rekod bayaran (slip atau mesej)", "Jadual syif / rekod jam kerja", "Laporan kiraan Hakku"],
  gig_rider: ["Notis penggantungan akaun", "Penyata pendapatan 30 hari terakhir", "Perjanjian perkhidmatan platform", "Laporan kiraan Hakku"],
  freelancer: ["Salinan invois", "Bukti penyerahan kerja", "Perbualan atau perjanjian dengan klien", "Laporan kiraan Hakku"],
  sme: ["Senarai gaji bulan semasa", "Perjanjian sewa / kontrak pekerjaan", "Laporan kiraan Hakku"],
};

const PARTY_PLACEHOLDER: Record<AgentCaseType, string> = {
  employee: "[nama majikan]",
  part_time: "[nama majikan]",
  gig_rider: "[nama platform]",
  freelancer: "[nama klien]",
  sme: "[nama syarikat]",
};

export function partyOrPlaceholder(caseType: AgentCaseType, name?: string) {
  return name && name.trim() ? name.trim() : PARTY_PLACEHOLDER[caseType];
}

const letters = "abcdefghij";

/** Engine citations are stored in English; formal BM letters cite the Malay act names. */
export function citationMs(c: string) {
  return c
    .replace(/Employment Act 1955/g, "Akta Kerja 1955")
    .replace(/Minimum Wages Order \(2025\/2026\)|Minimum Wages Order/g, "Perintah Gaji Minimum 2024, P.U.(A) 376/2024")
    .replace(/EPF Act 1991/g, "Akta KWSP 1991")
    .replace(/SOCSO Act 1969 & EIS Act 2017/g, "Akta Keselamatan Sosial Pekerja 1969 & Akta Sistem Insurans Pekerjaan 2017")
    .replace(/\(Amended (\d{4})\)/g, "(Pindaan $1)")
    .replace(/Gig Workers Act/g, "Akta Pekerja Gig")
    .replace(/Employees Provident Fund Act/g, "Akta Kumpulan Wang Simpanan Pekerja")
    .replace(/Employees' Social Security Act/g, "Akta Keselamatan Sosial Pekerja")
    .replace(/Stamp Act/g, "Akta Setem")
    .replace(/\bAct\b/g, "Akta");
}

export function buildFormalBmReport(caseType: AgentCaseType, findings: AgentFinding[], totalRm: number, counterparty?: string): FormalBmReport {
  const party = partyOrPlaceholder(caseType, counterparty);
  const rows = findings.filter((f) => f.level !== "info" || f.amountRm > 0);
  const butiran = rows
    .map((f, i) => {
      const amt = f.amountRm > 0 && !f.titleMs.includes(rmText(f.amountRm)) ? `: ${rmText(f.amountRm)}` : "";
      return `(${letters[i]}) ${f.titleMs}${amt}. ${f.workingMs} [${citationMs(f.citation)}]`;
    })
    .join("\n");
  const body = [
    "Tuan/Puan,",
    "",
    `Saya, [nama penuh seperti dalam MyKad], ingin mengemukakan aduan terhadap ${party} berhubung perkara di atas.`,
    "",
    "2. Butiran aduan adalah seperti berikut:",
    butiran,
    "",
    `3. Jumlah keseluruhan yang dianggarkan terhutang ialah ${rmText(totalRm)}. Kiraan ini dibuat berdasarkan maklumat yang saya berikan dan peruntukan undang-undang yang berkaitan.`,
    "",
    "4. Bersama-sama ini saya lampirkan dokumen sokongan seperti yang disenaraikan. Saya memohon pihak tuan/puan menyiasat perkara ini dan mengambil tindakan yang sewajarnya.",
    "",
    "Sekian, terima kasih.",
    "",
    "Yang benar,",
    "[nama penuh]",
    "[no. telefon]",
  ].join("\n");
  // Every RM figure in the template (totals and engine working) is the allow-list for the polish guard.
  const amountsUsedRm = [...new Set((body.match(/RM\s?[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi) ?? []).map((s) => Number(s.replace(/RM\s?|,/gi, ""))))];
  return { perkara: PERKARA[caseType], body, lampiran: LAMPIRAN[caseType], amountsUsedRm };
}

/** True only if the text mentions exactly the allowed ringgit amounts (no new, changed or missing figures). */
export function checkAmountsPreserved(text: string, allowedRm: number[]): boolean {
  const found = (text.match(/RM\s?[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi) ?? []).map((s) => Number(s.replace(/RM\s?|,/gi, "")).toFixed(2));
  const allowed = new Set(allowedRm.map((n) => n.toFixed(2)));
  return found.every((a) => allowed.has(a)) && [...allowed].every((a) => found.includes(a));
}
