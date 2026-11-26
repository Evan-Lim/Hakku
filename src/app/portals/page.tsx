"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { useHakku } from "@/lib/store/HakkuContext";
import { ArrowRight, Building, FileCheck, Landmark, Scale, ShieldCheck } from "lucide-react";

export default function PortalsDirectoryPage() {
  const { locale, portalPayload, digitalIdProfile, setMyDigitalIdDialogOpen } =
    useHakku();

  const portals = [
    {
      href: "/portals/perkeso",
      agency: "PERKESO (SOCSO)",
      title: "PERKESO ASSIST & Lindung Portal Mirror",
      url: "assist.perkeso.gov.my",
      badge: "SME & Freelancers",
      descEn:
        "Pre-filled Borang 8A schedule (local SOCSO/EIS + mandatory foreign-worker Lindung 24 Jam 0.75%) and freelancer 1.25% Lindung Kendiri (SKSPS).",
      descBm:
        "Jadual Borang 8A pra-isi (PERKESO/SIP + wajib Lindung 24 Jam 0.75% pekerja asing) dan Lindung Kendiri 1.25% (SKSPS).",
      icon: ShieldCheck,
    },
    {
      href: "/portals/kwsp",
      agency: "KWSP (EPF)",
      title: "KWSP i-Akaun & i-Saraan Portal Mirror",
      url: "kwsp.gov.my",
      badge: "SME, Workers & Gig",
      descEn:
        "Pre-filled Borang A (Citizen Third Schedule + 2% mandatory foreign-worker EPF), employee contribution verification, and i-Saraan 20% matching.",
      descBm:
        "Borang A pra-isi (Jadual Ketiga + 2% wajib pekerja asing), semakan penyata pekerja, dan penjejak padanan 20% i-Saraan.",
      icon: Landmark,
    },
    {
      href: "/portals/kesuma",
      agency: "KESUMA / JTKSM",
      title: "Working for Workers (WFW) & Act 872 Gig Tribunal Mirror",
      url: "workforworkers.com.my / tribunalgig.kesuma.gov.my",
      badge: "Workers & Gig Riders",
      descEn:
        "Pre-populated JTKSM labor grievance submission OR Gig Workers Tribunal Act 872 e-Filing (7-day payout & 14-day suspension 50% back-pay).",
      descBm:
        "Laporan WFW JTKSM pra-isi ATAU e-Pemfailan Tribunal Pekerja Gig Akta 872 (tunggakan 7 hari & elaun penggantungan 50%).",
      icon: Scale,
    },
    {
      href: "/portals/mytax",
      agency: "LHDN HASiL & SSM",
      title: "MyTax e-Duti Setem & SSM BizTrust Mirror",
      url: "mytax.hasil.gov.my",
      badge: "SMEs & Freelancers",
      descEn:
        "Pre-filled Item 4 (employment contracts > RM3,000) & Item 49(a) (workspace lease) stamp duty self-assessment + PKPS Dec 31, 2026 amnesty & Sijil Setem.",
      descBm:
        "Taksiran kendiri e-Duti Setem Butiran 4 & Butiran 49(a) pra-isi + semakan pengampunan PKPS 31 Dis 2026 & pratonton Sijil Setem.",
      icon: FileCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-3 border-b border-otl-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Tag variant="warning" size="small">
            PROTOTYPE PORTAL MIRRORS
          </Tag>
          <h1 className="mt-2 font-heading text-heading-sm font-semibold text-txt-black-900">
            {locale === "bm"
              ? "Direktori Simulasi Portal Rasmi Kerajaan"
              : "Official Government Portal Mirrors (Interactive Sandbox)"}
          </h1>
          <p className="mt-1 text-body-sm text-txt-black-500">
            {locale === "bm"
              ? "Memperlihatkan bagaimana Hakku akan mempraisi terus aplikasi kerajaan setelah disambungkan ke MyDigital ID & MyGDX."
              : "Demonstrating zero-retyping pre-fill across all 5 Malaysian statutory portals powered by MyDigital ID."}
          </p>
        </div>

        <Button
          variant="primary-outline"
          size="medium"
          onClick={() => setMyDigitalIdDialogOpen(true)}
        >
          <Building className="mr-2 h-4 w-4" />
          {digitalIdProfile.authenticated
            ? digitalIdProfile.nama
            : locale === "bm"
              ? "Sambung MyDigital ID"
              : "Connect MyDigital ID"}
        </Button>
      </div>

      <Callout variant="info">
        <CalloutTitle>
          {locale === "bm"
            ? `Rekod Aktif Sedia Dipraisi: ${portalPayload.entityOrWorkerName}`
            : `Active Workspace Payload Ready: ${portalPayload.entityOrWorkerName}`}
        </CalloutTitle>
        <CalloutContent>
          {locale === "bm"
            ? "Sebarang perubahan yang anda buat di Hab Pematuhan akan muncul secara automatik di semua portal cermin di bawah."
            : "Every calculation and drafted letter from your Compliance Hub automatically carries into each mirrored portal below."}
        </CalloutContent>
      </Callout>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {portals.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.href}
              className="flex flex-col justify-between rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-bg-primary-50 text-txt-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-body-xs font-semibold uppercase tracking-wide text-txt-black-500">
                      {p.agency}
                    </span>
                  </div>
                  <Tag size="small" variant="primary">
                    {p.badge}
                  </Tag>
                </div>

                <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                  {p.title}
                </h2>
                <p className="text-body-xs font-mono text-txt-primary">{p.url}</p>
                <p className="text-body-sm text-txt-black-700">
                  {locale === "bm" ? p.descBm : p.descEn}
                </p>
              </div>

              <div className="mt-5">
                <Button
                  asChild
                  variant="primary-fill"
                  size="medium"
                  className="w-full justify-center"
                >
                  <Link href={p.href}>
                    {locale === "bm" ? "Buka Portal Cermin" : "Open Mirrored Portal"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
