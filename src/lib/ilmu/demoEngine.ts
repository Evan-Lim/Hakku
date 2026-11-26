import { DEMO_SCENARIOS } from "@/data/demo-scenarios";
import { STATUTORY_KNOWLEDGE_CORPUS } from "@/data/statutory-2026/rules";
import { AppLocale, UserPersona } from "@/lib/engines/types";

export type DraftKind =
  | "hr_clarification"
  | "wfw_summary"
  | "client_reminder"
  | "gig_tribunal_dossier"
  | "sme_staff_advisory"
  | "pkps_stamp_cover";

export type DocumentScanType =
  | "payslip"
  | "gig_payout"
  | "employment_contract"
  | "workspace_lease";

export function runDemoOcr(params: {
  persona: UserPersona;
  documentType: DocumentScanType;
  fileName?: string;
  scenarioHint?: string;
  maskPii: boolean;
  fallbackNotice?: string;
}) {
  const { persona, documentType, fileName, scenarioHint, maskPii, fallbackNotice } =
    params;
  const matchingScenario =
    DEMO_SCENARIOS.find((s) => s.id === scenarioHint) ??
    DEMO_SCENARIOS.find((s) => s.persona === persona) ??
    DEMO_SCENARIOS[0];

  const demoExtraction =
    documentType === "gig_payout" && matchingScenario.gigCase
      ? {
          documentLabel: fileName || "Gig Platform / Client SOW Screenshot",
          extractedFields: {
            counterparty: matchingScenario.gigCase.platformOrClientName,
            amountRm: matchingScenario.gigCase.invoiceOrPayoutAmountRm,
            daysElapsed: matchingScenario.gigCase.daysSinceWorkCompleted,
            suspensionDays: matchingScenario.gigCase.suspensionDaysElapsed,
            skspsDeductedRm: matchingScenario.gigCase.platformSkspsDeductedRm,
            maskedNric: maskPii ? "94xxxx-xx-6019" : "940812-10-6019",
          },
        }
      : documentType === "workspace_lease" || documentType === "employment_contract"
        ? {
            documentLabel: fileName || "Signed Contract / Workspace Agreement PDF",
            extractedFields: {
              party: matchingScenario.entityName,
              instrumentType: matchingScenario.stampDuty?.instrumentType ?? documentType,
              monthlyAmountRm: matchingScenario.stampDuty?.monthlyWageOrRentRm ?? 3800,
              durationYears: matchingScenario.stampDuty?.tenancyYears ?? 2,
              signedDaysAgo: matchingScenario.stampDuty?.signedDaysAgo ?? 45,
              maskedNric: maskPii ? "88xxxx-xx-4321" : "880314-14-4321",
            },
          }
        : {
            documentLabel: fileName || "Malaysian Monthly Payslip Scan",
            extractedFields: {
              employer: matchingScenario.counterpartyName,
              staffCount: matchingScenario.payrollEmployees?.length ?? 1,
              leadEmployee: matchingScenario.payrollEmployees?.[0]?.name ?? "Staff",
              basicSalaryRm:
                matchingScenario.payrollEmployees?.[0]?.basicSalaryRm ?? 1650,
              fixedAllowanceRm:
                matchingScenario.payrollEmployees?.[0]?.fixedAllowanceRm ?? 250,
              maskedNric: maskPii ? "97xxxx-xx-5128" : "970504-10-5128",
            },
          };

  return {
    executionMode: "demo" as const,
    modelUsed: "ilmu-vision-v1.3 (Sovereign Sandbox)",
    residency: "Malaysia Onshore (Local Sandbox)",
    piiMasked: maskPii,
    fallbackNotice,
    ...demoExtraction,
    scenarioId: matchingScenario.id,
  };
}

export function runDemoAsr(params: {
  persona: UserPersona;
  scenarioId?: string;
  customSpokenHint?: string;
  fallbackNotice?: string;
}) {
  const { persona, scenarioId, customSpokenHint, fallbackNotice } = params;
  const scenario =
    DEMO_SCENARIOS.find((s) => s.id === scenarioId) ??
    DEMO_SCENARIOS.find((s) => s.persona === persona) ??
    DEMO_SCENARIOS[0];

  return {
    executionMode: "demo" as const,
    modelUsed: "ilmu-asr-v4.2 (Sovereign Sandbox)",
    transcript: customSpokenHint?.trim() || scenario.voiceTranscriptDemo,
    detectedLanguages: ["BM", "Manglish", "EN"],
    suggestedScenarioId: scenario.id,
    fallbackNotice,
  };
}

export function rankStatutoryCorpus(persona: UserPersona, query: string) {
  const qLower = query.toLowerCase();
  return STATUTORY_KNOWLEDGE_CORPUS.map((entry) => {
    let score = entry.personas.includes(persona) ? 2 : 0;
    for (const kw of entry.keywords) {
      if (qLower.includes(kw)) score += 3;
    }
    return { entry, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((r) => r.entry);
}

export function runDemoRag(params: {
  locale: AppLocale;
  persona: UserPersona;
  query: string;
  fallbackNotice?: string;
}) {
  const { locale, persona, query, fallbackNotice } = params;
  const matchedEntries = rankStatutoryCorpus(persona, query);
  const lead = matchedEntries[0];
  const answer =
    locale === "bm"
      ? `Berdasarkan ${lead.citation.act} (${lead.citation.section}): ${lead.practicalGuidanceBm} (${lead.citation.summaryBm})`
      : `Under ${lead.citation.act} (${lead.citation.section}): ${lead.practicalGuidanceEn} (${lead.citation.summaryEn})`;

  return {
    executionMode: "demo" as const,
    embeddingModel: "bge-m3 (Onshore Index)",
    chatModel: "ilmu-v3.1 (Sovereign Sandbox)",
    answer,
    citations: matchedEntries.map((m) => m.citation),
    fallbackNotice,
  };
}

export function buildSmoothDemoDraft(data: {
  locale: AppLocale;
  draftKind: DraftKind;
  partyName: string;
  counterpartyName: string;
  findingsSummary: string[];
  totalAmountRm: number;
}): {
  title: string;
  body: string;
} {
  const bullets =
    data.findingsSummary.length > 0
      ? data.findingsSummary.map((f) => `- ${f}`).join("\n")
      : "- Statutory alignment verification completed via Hakku.";
  const amt = `RM${data.totalAmountRm.toFixed(2)}`;

  if (data.locale === "bm") {
    switch (data.draftKind) {
      case "hr_clarification":
        return {
          title: "Nota Penjelasan Gaji Berhemah kepada HR",
          body: `Salam sejahtera pasukan HR ${data.counterpartyName},\n\nSaya ${data.partyName}. Semasa menyemak penyata gaji terkini melalui Hakku, saya perasan beberapa butiran yang mungkin memerlukan semakan semula:\n${bullets}\n\nJumlah anggaran pelarasan ialah ${amt}. Saya amat menghargai sekiranya pihak HR dapat mengesahkan kiraan ini bersama sebelum pusingan gaji seterusnya. Terima kasih atas kerjasama dan sokongan pihak tuan/puan.\n\nYang benar,\n${data.partyName}`,
        };
      case "wfw_summary":
        return {
          title: "Ringkasan Sokongan JTKSM / Working for Workers (WFW)",
          body: `PERKARA: Permohonan Semakan Gaji & Caruman Statutori — ${data.partyName}\nMajikan: ${data.counterpartyName}\n\nRingkasan Dapatan Statutori:\n${bullets}\n\nAnggaran perbezaan/pelarasan: ${amt}.\nDokumen sokongan: Slip gaji, rekod jam kerja lebih masa, dan jadual kiraan Akta Kerja 1955 dilampirkan untuk tindakan susulan JTKSM.`,
        };
      case "client_reminder":
        return {
          title: "Peringatan Bayaran Sopan (Rujukan Akta 872)",
          body: `Salam sejahtera pasukan ${data.counterpartyName},\n\nSekadar susulan mesra berhubung tugasan yang telah disiapkan bagi pihak ${data.partyName}. Mengikut penanda aras pembayaran Akta Pekerja Gig 2025 (Akta 872), jumlah tertunggak ialah ${amt}.\n\nButiran semakan:\n${bullets}\n\nMohon maklumkan tarikh pemprosesan bayaran agar rekod invois dapat dikemas kini dengan teratur. Terima kasih atas kerjasama berterusan.`,
        };
      case "gig_tribunal_dossier":
        return {
          title: "Draf Permohonan Tribunal Pekerja Gig (Akta 872)",
          body: `KEPADA: Tribunal Pekerja Gig (KESUMA)\nPemohon: ${data.partyName}\nEntiti Pengikatan / Platform: ${data.counterpartyName}\n\nTuntutan Utama (${amt}):\n${bullets}\n\nPermohonan ini difailkan untuk semakan adil di bawah Akta Pekerja Gig 2025 (Akta 872), termasuk bayaran hasil kerja tertunggak dan/atau elaun 50% sepanjang tempoh semakan penggantungan melebihi 14 hari.`,
        };
      case "sme_staff_advisory":
        return {
          title: "Memo Penyelarasan Pra-Gaji kepada Kakitangan PKS",
          body: `Kepada semua warga kerja ${data.partyName},\n\nBagi memastikan pematuhan penuh dengan peraturan kerja 2026 (gaji pokok minimum RM1,700, caruman KWSP 2% pekerja asing, serta pilihan Lindung 24 Jam PERKESO), pengurusan telah menjalankan semakan pra-gaji:\n${bullets}\n\nSila maklumkan kepada HR sekiranya anda ingin mengemas kini borang pilihan Lindung 24 Jam sebelum tarikh pembayaran gaji.`,
        };
      case "pkps_stamp_cover":
        return {
          title: "Ringkasan Penyeteman e-Duti Setem / PKPS MyTax",
          body: `Entiti: ${data.partyName}\nAnggaran Duti Setem: ${amt}\n\nPerkara Semakan:\n${bullets}\n\nTindakan: Hantar pengisytiharan melalui portal e-Duti Setem MyTax (dan manfaatkan skim pengampunan sukarela PKPS sebelum 31 Disember 2026 bagi dokumen melebihi tempoh 30 hari).`,
        };
    }
  }

  switch (data.draftKind) {
    case "hr_clarification":
      return {
        title: "Constructive HR Payroll Clarification Note",
        body: `Dear ${data.counterpartyName} HR & Payroll Team,\n\nI hope you are well. While reviewing my latest payslip, I noticed a few statutory items that may need a quick payroll adjustment:\n${bullets}\n\nEstimated variance: ${amt}. I would appreciate a brief review together before the next payroll cycle so our records stay aligned. Thank you for your help!\n\nWarm regards,\n${data.partyName}`,
      };
    case "wfw_summary":
      return {
        title: "JTKSM / Working for Workers (WFW) Submission Summary",
        body: `SUBJECT: Statutory Wage & Deduction Review — ${data.partyName}\nEmployer: ${data.counterpartyName}\n\nVerified Statutory Findings:\n${bullets}\n\nTotal Estimated Shortfall/Adjustment: ${amt}.\nPrepared with Employment Act 1955 / PERKESO / EPF deterministic schedule for JTKSM WFW submission.`,
      };
    case "client_reminder":
      return {
        title: "Polite Invoice & Payout Follow-Up (Act 872 Benchmark)",
        body: `Hi ${data.counterpartyName} Team,\n\nHope your week is going smoothly. Following up kindly on the completed engagement for ${data.partyName}. Under the Gig Workers Act 2025 (Act 872) 7-day settlement standard, ${amt} remains open:\n${bullets}\n\nPlease let me know the expected remittance date so I can close out the invoice and statutory records. Thank you!`,
      };
    case "gig_tribunal_dossier":
      return {
        title: "Gig Workers Tribunal Pre-Filing Dossier (Act 872)",
        body: `TO: Gig Workers Tribunal (KESUMA)\nClaimant: ${data.partyName}\nContracting Entity / Platform: ${data.counterpartyName}\n\nStructured Claim Summary (${amt}):\n${bullets}\n\nSubmitted for fair resolution under the Gig Workers Act 2025 (Act 872), including unpaid earned fees, 14-day suspension cap review, and statutory 50% inquiry allowance.`,
      };
    case "sme_staff_advisory":
      return {
        title: "SME Pre-Payday Compliance & Staff Advisory Memo",
        body: `Dear ${data.partyName} Team,\n\nAhead of this month's payroll run, we audited all statutory items against 2026 Malaysian regulations (RM1,700 basic wage floor, 2% mandatory foreign-worker EPF, and PERKESO Lindung 24 Jam options):\n${bullets}\n\nPlease verify your Lindung 24 Jam preference with HR if you wish to update your enrollment status before payday.`,
      };
    case "pkps_stamp_cover":
      return {
        title: "MyTax e-Duti Setem & PKPS Filing Summary",
        body: `Entity / Party: ${data.partyName}\nAssessed Stamp Duty: ${amt}\n\nAssessment Details:\n${bullets}\n\nNext Step: Submit assessment via LHDN MyTax e-Duti Setem (utilizing the PKPS voluntary disclosure window prior to December 31, 2026 for documents past 30 days).`,
      };
  }
}

export function runDemoTts(params: {
  locale: AppLocale;
  text: string;
  fallbackNotice?: string;
}) {
  return {
    executionMode: "demo" as const,
    modelUsed: "ilmu-tts-v2 (Browser Voice Fallback)",
    audioDataUrl: null as string | null,
    fallbackSpeechText: params.text,
    locale: params.locale,
    fallbackNotice: params.fallbackNotice,
  };
}
