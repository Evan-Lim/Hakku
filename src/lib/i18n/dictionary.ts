import { AppLocale } from "@/lib/engines/types";

export const DICTIONARY: Record<AppLocale, Record<string, string>> = {
  en: {
    brandName: "Hakku",
    tagline: "Fair Work. Clear Compliance. Direct Gov Sync.",
    announceBanner:
      "Hackathon Prototype · Sovereign AI powered by YTL ILMU · MyDigital ID & Official Portal Sandbox Ready",
    navHome: "Overview",
    navWorkspace: "Compliance Hub",
    navPortals: "Official Portal Mirrors",
    navVision: "MyDigital ID Vision",
    signInMyDigitalId: "Connect MyDigital ID (Sandbox)",
    signedInLabel: "MyDigital ID Connected",
    roleFreelancer: "Freelance Business & Gig",
    roleSme: "SME Business Owner",
    roleWorker: "Employee & Worker",
    heroTitle: "Your Sovereign Companion for Malaysian Work, Freelance & SME Compliance",
    heroSubtitle:
      "Check payslips, protect freelance & gig payments under Act 872, validate SME payroll & e-Duti Setem, and preview seamless MyDigital ID portal sync — processed 100% on Malaysian soil.",
    ctaOpenWorkspace: "Open Compliance Hub",
    ctaTryDemo: "Explore Instant Demo Cases",
    ctaPortals: "Open Official Portal Mirrors",
    intakeTitle: "Private Document & Voice Check",
    intakeSubtitle:
      "Scan a payslip, gig payout screenshot, employment contract, or workspace lease — or explain your situation in English, BM, or Manglish.",
    syncToPortalsCta: "Sync Pre-Filled Data to Official Portal Mirror",
    draftingTitle: "Guided Resolution & Submission Studio",
    draftingSubtitle:
      "Start with calm, constructive communication — with official agency submission drafts ready whenever needed.",
    disclaimer:
      "Hakku provides administrative calculations and statutory guidance for educational and pre-filing preparation; it does not constitute formal legal representation.",
    sovereignBadge: "100% Onshore Malaysian Sovereign AI (YTL ILMU)",
    mirrorWarning:
      "PROTOTYPE PORTAL MIRROR (SIMULASI) — Previewing future MyDigital ID SSO & MyGDX agency integration. No live government data is transmitted.",
  },
  bm: {
    brandName: "Hakku",
    tagline: "Kerja Adil. Pematuhan Jelas. Pautan Terus Kerajaan.",
    announceBanner:
      "Prototip Hackathon · AI Berdaulat oleh YTL ILMU · Sedia Simulasi MyDigital ID & Portal Rasmi",
    navHome: "Utama",
    navWorkspace: "Hab Pematuhan",
    navPortals: "Simulasi Portal Rasmi",
    navVision: "Visi MyDigital ID",
    signInMyDigitalId: "Sambung MyDigital ID (Simulasi)",
    signedInLabel: "MyDigital ID Disambung",
    roleFreelancer: "Perniagaan Bebas & Gig",
    roleSme: "Pemilik Perniagaan PKS",
    roleWorker: "Pekerja Sepenuh Masa",
    heroTitle: "Rakan Pintar Berdaulat untuk Pekerja, Freelancer & Pemilik Perniagaan Malaysia",
    heroSubtitle:
      "Semak slip gaji, lindungi bayaran kerja bebas & gig di bawah Akta 872, sahkan gaji PKS & e-Duti Setem, dan pratonton pautan terus MyDigital ID — diproses 100% di Malaysia.",
    ctaOpenWorkspace: "Buka Hab Pematuhan",
    ctaTryDemo: "Cuba Kes Demo Segera",
    ctaPortals: "Buka Simulasi Portal Rasmi",
    intakeTitle: "Imbasan Dokumen & Suara Sulit",
    intakeSubtitle:
      "Imbas slip gaji, tangkap layar bayaran gig, kontrak kerja, atau perjanjian premis — atau ceritakan situasi anda dalam Bahasa Melayu, Inggeris, atau Manglish.",
    syncToPortalsCta: "Hantar Data Pra-Isi ke Simulasi Portal Rasmi",
    draftingTitle: "Studio Penyelesaian & Draf Rasmi",
    draftingSubtitle:
      "Mulakan dengan komunikasi berhemah bersama majikan atau klien — berserta draf rasmi agensi jika diperlukan.",
    disclaimer:
      "Hakku menyediakan kiraan pentadbiran dan panduan statutori sebagai persediaan awal; ia bukan pengganti nasihat atau perwakilan guaman rasmi.",
    sovereignBadge: "100% AI Berdaulat di Bumi Malaysia (YTL ILMU)",
    mirrorWarning:
      "SIMULASI PORTAL RASMI (PROTOTYPE MIRROR) — Memaparkan integrasi masa hadapan bersama MyDigital ID SSO & MyGDX. Tiada data rasmi kerajaan dihantar.",
  },
};

export function t(locale: AppLocale, key: string): string {
  return DICTIONARY[locale][key] ?? DICTIONARY.en[key] ?? key;
}
