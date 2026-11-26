"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { useHakku } from "@/lib/store/HakkuContext";
import { t } from "@/lib/i18n/dictionary";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    locale,
    setPersona,
    setActiveScenarioId,
    setMyDigitalIdDialogOpen,
    digitalIdProfile,
  } = useHakku();

  const launchPersona = (role: "freelancer" | "sme" | "worker", scenarioId?: string) => {
    setPersona(role);
    if (scenarioId) {
      setActiveScenarioId(scenarioId);
    }
    router.push(`/workspace?role=${role}${scenarioId ? `&scenario=${scenarioId}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6 md:py-12">
      {/* MYDS 12-8-4 Hero Grid */}
      <section className="grid grid-cols-4 gap-6 md:grid-cols-8 lg:grid-cols-12 lg:items-center">
        <div className="col-span-4 space-y-5 md:col-span-8 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Tag variant="primary" size="medium" mode="pill">
              {locale === "bm"
                ? "AI Berdaulat Malaysia · YTL ILMU"
                : "Malaysia Sovereign AI · YTL ILMU"}
            </Tag>
            <Tag variant="success" size="medium" mode="pill" dot>
              {locale === "bm" ? "Dikemas Kini 2026" : "Updated 2026 Regulations"}
            </Tag>
          </div>

          <h1 className="font-heading text-heading-sm font-semibold tracking-tight text-txt-black-900 md:text-heading-md lg:text-heading-lg">
            {t(locale, "heroTitle")}
          </h1>

          <p className="text-body-md text-txt-black-700 md:text-body-lg">
            {t(locale, "heroSubtitle")}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              variant="primary-fill"
              size="large"
              onClick={() => router.push("/workspace")}
            >
              {t(locale, "ctaOpenWorkspace")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="primary-outline"
              size="large"
              onClick={() => router.push("/portals")}
            >
              <Landmark className="mr-2 h-4 w-4" />
              {t(locale, "ctaPortals")}
            </Button>

            <Button
              variant="default-outline"
              size="large"
              onClick={() => setMyDigitalIdDialogOpen(true)}
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-txt-primary" />
              {digitalIdProfile.authenticated
                ? digitalIdProfile.nama.split(" ")[0]
                : t(locale, "signInMyDigitalId")}
            </Button>
          </div>
        </div>

        {/* Right summary card */}
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <div className="rounded-xl border border-otl-gray-200 bg-bg-washed p-5 shadow-card md:p-6">
            <div className="flex items-center justify-between border-b border-otl-gray-200 pb-3">
              <span className="font-heading text-body-md font-semibold text-txt-black-900">
                {locale === "bm"
                  ? "Seni Bina Teras & Visi Langsung"
                  : "Prototype Mirror + Live MyDigital ID Vision"}
              </span>
              <Tag variant="warning" size="small">
                Sandbox
              </Tag>
            </div>
            <ul className="mt-4 space-y-3 text-body-sm text-txt-black-700">
              <li className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-txt-primary" />
                <span>
                  <strong className="text-txt-black-900">
                    {locale === "bm" ? "Multimodal Tempatan:" : "Onshore Multimodal AI:"}
                  </strong>{" "}
                  <code>ilmu-vision-v1.3</code> OCR, <code>ilmu-asr-v4.2</code> Manglish voice,{" "}
                  <code>bge-m3</code> RAG & <code>ilmu-tts-v2</code> audio.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-txt-success" />
                <span>
                  <strong className="text-txt-black-900">
                    {locale === "bm" ? "Kiraan Statutori Tepat:" : "Zero-Hallucination Math:"}
                  </strong>{" "}
                  {locale === "bm"
                    ? "Gaji pokok RM1,700, KWSP 2% pekerja asing, Lindung 24 Jam, Akta 872 & e-Duti Setem 2026."
                    : "RM1,700 basic floor, 2% foreign-worker EPF, Lindung 24 Jam, Act 872 & 2026 e-Duti Setem."}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-txt-primary" />
                <span>
                  <strong className="text-txt-black-900">
                    {locale === "bm" ? "Pautan MyDigital ID:" : "MyDigital ID + Gov Portals:"}
                  </strong>{" "}
                  {locale === "bm"
                    ? "Prototip ini menyediakan cermin portal rasmi pra-isi; fasa komersial akan berhubung terus via MyDigital ID & MyGDX."
                    : "Prototype mirrors 5 official gov portals with 1-click pre-fill; production connects directly via MyDigital ID & MyGDX."}
                </span>
              </li>
            </ul>
            <div className="mt-4 border-t border-otl-gray-200 pt-3">
              <Link
                href="/vision"
                className="inline-flex items-center text-body-sm font-medium text-txt-primary hover:underline"
              >
                {locale === "bm"
                  ? "Lihat pelan hala tuju MyDigital ID untuk pelabur & penganjur"
                  : "View MyDigital ID + Direct Gov Access pitch architecture"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Target Personas */}
      <section className="mt-12 space-y-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-heading-xs font-semibold text-txt-black-900">
            {locale === "bm"
              ? "Dibina untuk Seluruh Ekosistem Kerja & Perniagaan Malaysia"
              : "Designed for Every Corner of Malaysia's Working Economy"}
          </h2>
          <p className="text-body-sm text-txt-black-500">
            {locale === "bm"
              ? "Pilih peranan anda untuk membuka kiraan statutori, panduan berhemah dan integrasi portal."
              : "Choose your workspace track to verify pay, contracts, statutory contributions, and portal submissions."}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-5 md:grid-cols-8 lg:grid-cols-12">
          {/* Freelancers & Gig */}
          <div className="col-span-4 flex flex-col justify-between rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-bg-primary-50 text-txt-primary">
                  <Briefcase className="h-5 w-5" />
                </span>
                <Tag variant="primary" size="small">
                  Act 872 · 2026
                </Tag>
              </div>
              <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                {locale === "bm"
                  ? "Pemilik Perniagaan Bebas & Pekerja Gig"
                  : "Freelance Business Owners & Gig Workers"}
              </h3>
              <p className="text-body-sm text-txt-black-700">
                {locale === "bm"
                  ? "Semak terma perjanjian Akta 872, pantau tempoh bayaran 7 hari, kira elaun penggantungan 50%, PERKESO Lindung Kendiri 1.25%, KWSP i-Saraan & duti setem studio."
                  : "Verify Act 872 SOWs, track 7-day payout milestones, calculate 50% suspension back-pay, plan 1.25% Lindung Kendiri & i-Saraan 20% match, and stamp workspace leases."}
              </p>
            </div>
            <div className="mt-5">
              <Button
                variant="primary-outline"
                size="medium"
                className="w-full justify-center"
                onClick={() => launchPersona("freelancer", "freelancer-hafiz")}
              >
                {locale === "bm" ? "Buka Hab Freelance" : "Open Freelancer Hub"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* SME Employers */}
          <div className="col-span-4 flex flex-col justify-between rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-bg-success-50 text-txt-success">
                  <Building2 className="h-5 w-5" />
                </span>
                <Tag variant="success" size="small">
                  Pre-Payday Shield
                </Tag>
              </div>
              <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                {locale === "bm"
                  ? "Pemilik Perniagaan Sepenuh Masa (PKS)"
                  : "Full-Time Business Owners (SME Employers)"}
              </h3>
              <p className="text-body-sm text-txt-black-700">
                {locale === "bm"
                  ? "Lindungi perniagaan sebelum hari gaji: sahkan gaji pokok RM1,700, KWSP 2% pekerja asing, PERKESO Lindung 24 Jam, kontrak kerja Butiran 4 & sewaan premis PKPS."
                  : "Catch payroll issues before payday: validate RM1,700 basic pay, 2% mandatory foreign-worker EPF, Lindung 24 Jam, Item 4 employment stamping & commercial lease PKPS."}
              </p>
            </div>
            <div className="mt-5">
              <Button
                variant="primary-outline"
                size="medium"
                className="w-full justify-center"
                onClick={() => launchPersona("sme", "sme-razak")}
              >
                {locale === "bm" ? "Buka Hab Majikan PKS" : "Open SME Payroll Hub"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Employees */}
          <div className="col-span-4 flex flex-col justify-between rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card md:col-span-8 lg:col-span-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-bg-warning-50 text-txt-warning">
                  <UserCheck className="h-5 w-5" />
                </span>
                <Tag variant="warning" size="small">
                  Payslip & WFW
                </Tag>
              </div>
              <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                {locale === "bm"
                  ? "Pekerja Sepenuh Masa & Kontrak"
                  : "Full-Time & Contract Workers"}
              </h3>
              <p className="text-body-sm text-txt-black-700">
                {locale === "bm"
                  ? "Fahami slip gaji anda dengan jelas — kiraan OT 1.5x/2x/3x, gaji pokok vs elaun, potongan KWSP/PERKESO — serta nota penjelasan sopan HR dan draf WFW JTKSM."
                  : "Get instant clarity on your payslip — 1.5x/2x/3x OT, basic pay vs allowances, EPF/PERKESO/Lindung 24 Jam — with polite HR notes and JTKSM WFW filing prep."}
              </p>
            </div>
            <div className="mt-5">
              <Button
                variant="primary-outline"
                size="medium"
                className="w-full justify-center"
                onClick={() => launchPersona("worker", "worker-aina")}
              >
                {locale === "bm" ? "Semak Slip Gaji" : "Verify My Payslip"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* One-Click Demo Scenarios */}
      <section className="mt-12 space-y-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-heading-xs font-semibold text-txt-black-900">
            {locale === "bm"
              ? "Senario Demo Segera (1-Klik)"
              : "Instant 1-Click Malaysian Demo Scenarios"}
          </h2>
          <p className="text-body-sm text-txt-black-500">
            {locale === "bm"
              ? "Uji aliran kerja penuh daripada imbasan dokumen & suara hingga ke simulasi portal rasmi."
              : "Jump straight into realistic 2026 Malaysian cases from multimodal intake to mirrored portal sync."}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12">
          {DEMO_SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="col-span-4 flex flex-col justify-between rounded-lg border border-otl-gray-200 bg-bg-washed p-4 md:col-span-4 lg:col-span-3"
            >
              <div>
                <Tag size="small" variant="default">
                  {locale === "bm" ? sc.badgeBm : sc.badgeEn}
                </Tag>
                <h3 className="mt-2 font-heading text-body-md font-semibold text-txt-black-900">
                  {locale === "bm" ? sc.titleBm : sc.titleEn}
                </h3>
                <p className="mt-1.5 text-body-xs text-txt-black-700">
                  {locale === "bm" ? sc.subtitleBm : sc.subtitleEn}
                </p>
              </div>
              <Button
                variant="default-outline"
                size="small"
                className="mt-4 w-full justify-center bg-bg-white"
                onClick={() => launchPersona(sc.persona, sc.id)}
              >
                {locale === "bm" ? "Muatkan Kes Ini" : "Load Case"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Transparent Mirror Callout */}
      <section className="mt-10">
        <Callout variant="info">
          <CalloutTitle>
            {locale === "bm"
              ? "Ketelusan Prototip: Simulasi Portal Rasmi Kerajaan"
              : "Prototype Transparency: Interactive Official Portal Mirrors"}
          </CalloutTitle>
          <CalloutContent>
            {locale === "bm"
              ? "Bahagian Simulasi Portal Rasmi memaparkan cermin interaktif PERKESO ASSIST, KWSP i-Akaun/i-Saraan, JTKSM WFW, Tribunal Pekerja Gig, dan MyTax e-Duti Setem bagi membuktikan pengalaman pra-isi bersama MyDigital ID."
              : "Our Official Portal Mirrors replicate PERKESO ASSIST, KWSP i-Akaun/i-Saraan, JTKSM Working for Workers, Gig Workers Tribunal, and LHDN MyTax e-Duti Setem to demonstrate the exact zero-retyping UX enabled by MyDigital ID."}
          </CalloutContent>
        </Callout>
      </section>
    </div>
  );
}
