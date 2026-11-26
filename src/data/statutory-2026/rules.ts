import { StatutoryCitation } from "@/lib/engines/types";

export const STATUTORY_CONSTANTS_2026 = {
  minimumWageRm: 1700,
  ea1955StandardMonthDays: 26,
  ea1955MaxDailyHours: 8,
  ea1955MaxWeeklyHours: 45,
  socsoCeilingRm: 6000,
  lindung24JamPhase1Rate: 0.0075, // 0.75% SKBBK employee-borne up to RM6,000 ceiling
  epfForeignWorkerRate: 0.02, // 2% employee + 2% employer (Oct 2025 mandate)
  act872PayoutDeadlineDays: 7,
  act872SuspensionCapDays: 14,
  act872SuspensionBackPayRate: 0.5, // 50% average daily earnings
  act872SkspsContributionRate: 0.0125, // 1.25% PERKESO Lindung Kendiri / SKSPS
  iSaraanMatchRate: 0.2, // 20% gov matching incentive
  iSaraanAnnualCapRm: 500, // Standard annual matching cap benchmark
  stampItem4ExemptionSalaryRm: 3000, // Effective 1 Jan 2026
  stampItem4StandardDutyRm: 10,
  stampDuplicateCopyDutyRm: 10,
  stampWindowDays: 30,
  pkpsAmnestyExpiryDate: "2026-12-31",
} as const;

export const CITATIONS: Record<string, StatutoryCitation> = {
  MIN_WAGE_1700: {
    act: "Minimum Wages Order (2025/2026)",
    section: "RM1,700 Basic Wage Floor",
    summaryEn:
      "Basic monthly salary must be at least RM1,700 excluding allowances, overtime, or service charges.",
    summaryBm:
      "Gaji pokok bulanan mestilah sekurang-kurangnya RM1,700 tidak termasuk elaun, kerja lebih masa, atau caj perkhidmatan.",
  },
  EA_1955_OVERTIME: {
    act: "Employment Act 1955 (Act 265)",
    section: "s.60A / s.60I (ORP, HRP & Overtime)",
    summaryEn:
      "ORP = Monthly Basic / 26, HRP = ORP / normal daily hours (max 8h). Normal OT is 1.5x HRP; rest day OT is 2.0x; public holiday OT is 3.0x.",
    summaryBm:
      "KGB (ORP) = Gaji Pokok / 26, KBJ (HRP) = KGB / jam kerja harian (maks 8 jam). OT biasa 1.5x; hari rehat 2.0x; cuti umum 3.0x.",
  },
  EPF_THIRD_SCHEDULE: {
    act: "EPF Act 1991 (Act 452)",
    section: "Third Schedule (Part A & Part E)",
    summaryEn:
      "Citizen/PR contributions follow fixed Third Schedule bands (11% employee, 13% employer <= RM5,000 or 12% > RM5,000), rounded up to the next RM1.",
    summaryBm:
      "Caruman warganegara/PR mengikut jadual kadar berjadual Jadual Ketiga (11% pekerja, 13% majikan <= RM5,000 atau 12% > RM5,000), dibundarkan ke RM1 teratas.",
  },
  EPF_FOREIGN_2PCT: {
    act: "EPF Act 1991 (Amended 2025)",
    section: "Part F — Mandatory Non-Citizen EPF",
    summaryEn:
      "Effective October 2025, documented foreign workers and employers contribute 2% each on monthly wages (>= RM1,700 floor), rounded up to the next RM1.",
    summaryBm:
      "Berkuat kuasa Oktober 2025, pekerja asing sah dan majikan wajib mencarum 2% setiap pihak ke atas gaji bulanan (>= RM1,700), dibundarkan ke RM1 teratas.",
  },
  PERKESO_SOCSO_EIS: {
    act: "SOCSO Act 1969 & EIS Act 2017",
    section: "RM6,000 Insured Wage Ceiling",
    summaryEn:
      "PERKESO Category 1 (1.75% employer / 0.5% employee) and EIS (0.2% each for citizens under 60) follow RM100 wage midpoint bands up to RM6,000.",
    summaryBm:
      "PERKESO Kategori 1 (1.75% majikan / 0.5% pekerja) dan SIP/EIS (0.2% setiap pihak bagi warganegara <60 tahun) mengikut julat RM100 sehingga siling RM6,000.",
  },
  LINDUNG_24_JAM: {
    act: "PERKESO Skim Kemalangan Bukan Bencana Kerja (SKBBK)",
    section: "Lindung 24 Jam (July 2026)",
    summaryEn:
      "Phase 1 employee contribution is 0.75% up to RM6,000 ceiling. Mandatory for foreign workers; optional (opt-out permitted) for Malaysian citizens.",
    summaryBm:
      "Caruman fasa 1 pekerja ialah 0.75% sehingga siling RM6,000. Wajib bagi pekerja asing; pilihan (pengecualian dibenarkan) bagi warganegara Malaysia.",
  },
  ACT_872_GIG_CONTRACT: {
    act: "Gig Workers Act 2025 (Act 872)",
    section: "Part II — Written Service Agreements",
    summaryEn:
      "In force March 31, 2026: platforms and contracting entities must provide clear written terms covering scope, fee calculation, payout timing, and review procedures.",
    summaryBm:
      "Berkuat kuasa 31 Mac 2026: entiti pengikatan dan platform wajib menyediakan terma bertulis yang jelas mengenai skop, kiraan bayaran, jadual pembayaran, dan prosedur semakan.",
  },
  ACT_872_PAYOUT_SUSPENSION: {
    act: "Gig Workers Act 2025 (Act 872)",
    section: "7-Day Payout & 14-Day Suspension Cap (50% Back-Pay)",
    summaryEn:
      "Earned payouts are protected within 7-day settlement benchmarks; account suspensions cannot exceed 14 days without resolution and carry 50% average daily earnings allowance.",
    summaryBm:
      "Bayaran hasil kerja dilindungi di bawah penanda aras 7 hari; penggantungan akaun tidak boleh melebihi 14 hari tanpa keputusan serta melayakkan elaun 50% purata pendapatan harian.",
  },
  ACT_872_SKSPS_TRIB: {
    act: "Gig Workers Act 2025 (Act 872) & SKSPS",
    section: "1.25% Lindung Kendiri & Gig Workers Tribunal",
    summaryEn:
      "Supports mandatory 1.25% PERKESO self-employed social protection integration and accessible self-representation before the Gig Workers Tribunal.",
    summaryBm:
      "Menyokong integrasi caruman 1.25% PERKESO Lindung Kendiri serta pembelaan kendiri terus di Tribunal Pekerja Gig tanpa peguam.",
  },
  STAMP_ITEM_4: {
    act: "Stamp Act 1949 (Amended 2026)",
    section: "First Schedule Item 4 — Employment Contracts",
    summaryEn:
      "From Jan 1, 2026, employment contracts with monthly remuneration <= RM3,000 are exempt from stamp duty; contracts > RM3,000 attract RM10 duty via MyTax e-Duti Setem.",
    summaryBm:
      "Mulai 1 Jan 2026, kontrak kerja bergaji bulanan <= RM3,000 dikecualikan duti setem; kontrak > RM3,000 dikenakan duti RM10 melalui e-Duti Setem MyTax.",
  },
  STAMP_ITEM_49A: {
    act: "Stamp Act 1949 (2026 Self-Assessment)",
    section: "First Schedule Item 49(a) & PKPS Amnesty",
    summaryEn:
      "The historical RM2,400 annual rent exemption is abolished; tenancy duty applies to full annual rent per RM250 block (RM1/RM3/RM5/RM7). PKPS amnesty ends Dec 31, 2026.",
    summaryBm:
      "Pengecualian sewa tahunan RM2,400 telah dimansuhkan; duti dikenakan atas keseluruhan sewa tahunan setiap RM250 (RM1/RM3/RM5/RM7). Pengampunan PKPS tamat 31 Dis 2026.",
  },
};

export interface StatutoryKnowledgeEntry {
  id: string;
  topic: string;
  personas: ("freelancer" | "sme" | "worker")[];
  keywords: string[];
  citation: StatutoryCitation;
  practicalGuidanceEn: string;
  practicalGuidanceBm: string;
}

export const STATUTORY_KNOWLEDGE_CORPUS: StatutoryKnowledgeEntry[] = [
  {
    id: "min-wage-1700",
    topic: "RM1,700 Minimum Basic Wage vs Allowances",
    personas: ["sme", "worker"],
    keywords: ["minimum wage", "gaji minimum", "1700", "allowance", "elaun", "basic", "gaji pokok"],
    citation: CITATIONS.MIN_WAGE_1700,
    practicalGuidanceEn:
      "Employers cannot bundle transport, meal, or attendance allowances to reach RM1,700. Basic salary alone must meet RM1,700, and OT/EPF calculations depend on the proper basic wage.",
    practicalGuidanceBm:
      "Majikan tidak boleh mencampur elaun pengangkutan, makan, atau kehadiran untuk mencukupkan RM1,700. Gaji pokok sahaja mesti mencapai RM1,700.",
  },
  {
    id: "epf-foreign-2pct",
    topic: "Mandatory 2% Foreign Worker EPF (Oct 2025+)",
    personas: ["sme", "worker"],
    keywords: ["epf", "kwsp", "foreign worker", "pekerja asing", "2%", "jadual ketiga", "third schedule"],
    citation: CITATIONS.EPF_FOREIGN_2PCT,
    practicalGuidanceEn:
      "Calculate 2% of gross statutory wages for the employee and 2% for the employer, rounding each share independently UP to the next whole ringgit.",
    practicalGuidanceBm:
      "Kira 2% daripada gaji statutori untuk pekerja asing dan 2% untuk majikan, dengan setiap bahagian dibundarkan ke atas kepada ringgit penuh berikutnya.",
  },
  {
    id: "lindung-24-jam",
    topic: "PERKESO Lindung 24 Jam (SKBBK) Rules",
    personas: ["sme", "worker"],
    keywords: ["lindung", "24 jam", "skbbk", "perkeso", "socso", "0.75%", "opt out", "opt-out"],
    citation: CITATIONS.LINDUNG_24_JAM,
    practicalGuidanceEn:
      "Foreign workers must be enrolled (0.75% Phase 1 employee-funded up to RM6,000 ceiling). Malaysian citizens may opt out; deducting it after a valid opt-out should be refunded.",
    practicalGuidanceBm:
      "Pekerja asing wajib didaftarkan (0.75% Fasa 1 ditanggung pekerja sehingga siling RM6,000). Warganegara Malaysia boleh memilih keluar; potongan tanpa persetujuan perlu diselaraskan.",
  },
  {
    id: "act-872-freelance",
    topic: "Gig Workers Act 2025 (Act 872) — Freelancers & Riders",
    personas: ["freelancer"],
    keywords: ["act 872", "akta 872", "gig", "freelance", "7 day", "14 day", "suspension", "gantung", "tribunal", "sksps", "1.25%"],
    citation: CITATIONS.ACT_872_PAYOUT_SUSPENSION,
    practicalGuidanceEn:
      "Act 872 covers both platform riders and independent freelancers (photographers, designers, translators, consultants). Keep written SOWs, track 7-day invoice milestones, and claim 50% allowance if suspended.",
    practicalGuidanceBm:
      "Akta 872 melindungi penunggang platform dan pekerja bebas (jurugambar, pereka, penterjemah, perunding). Simpan perjanjian bertulis, jejak tempoh bayaran 7 hari, dan tuntut elaun 50% jika digantung.",
  },
  {
    id: "stamp-duty-2026",
    topic: "2026 MyTax e-Duti Setem (Employment & Workspace Leases)",
    personas: ["sme", "freelancer", "worker"],
    keywords: ["stamp", "duti setem", "mytax", "item 4", "item 49", "pkps", "3000", "2400", "tenancy", "sewa"],
    citation: CITATIONS.STAMP_ITEM_49A,
    practicalGuidanceEn:
      "Employment contracts <= RM3,000/month are stamp-exempt; > RM3,000 are RM10. Workspace/shop-lot leases calculate duty on full annual rent (no RM2,400 exemption). Regularize older documents under PKPS before 31 Dec 2026.",
    practicalGuidanceBm:
      "Kontrak kerja <= RM3,000/bulan dikecualikan; > RM3,000 ialah RM10. Sewaan premis dikira atas sewa tahunan penuh (tiada pengecualian RM2,400). Selesaikan dokumen lama di bawah PKPS sebelum 31 Dis 2026.",
  },
];
