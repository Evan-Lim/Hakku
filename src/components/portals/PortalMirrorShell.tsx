"use client";

import React from "react";
import Link from "next/link";
import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
  MastheadTitle,
  MastheadTrigger,
} from "@govtechmy/myds-react/masthead";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@govtechmy/myds-react/breadcrumb";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { Tag } from "@govtechmy/myds-react/tag";
import { Button } from "@govtechmy/myds-react/button";
import { useHakku } from "@/lib/store/HakkuContext";
import { t } from "@/lib/i18n/dictionary";
import { ArrowLeft, Globe, Lock, ShieldCheck } from "lucide-react";

interface PortalMirrorShellProps {
  agencyName: string;
  portalTitle: string;
  mirroredUrl: string;
  children: React.ReactNode;
}

export function PortalMirrorShell({
  agencyName,
  portalTitle,
  mirroredUrl,
  children,
}: PortalMirrorShellProps) {
  const { locale, digitalIdProfile, setMyDigitalIdDialogOpen } = useHakku();

  return (
    <div className="min-h-screen bg-bg-washed pb-12">
      {/* Authentic MYDS Official-Style Masthead inside Mirror Sandbox */}
      <Masthead className="no-print">
        <MastheadHeader>
          <MastheadTitle>
            {locale === "bm"
              ? `Simulasi Portal Rasmi (${agencyName})`
              : `Simulated Official Government Portal Mirror (${agencyName})`}
          </MastheadTitle>
          <MastheadTrigger>
            {locale === "bm" ? "Maklumat Simulasi" : "Verify Mirror Mode"}
          </MastheadTrigger>
        </MastheadHeader>
        <MastheadContent>
          <MastheadSection
            icon={<Globe className="h-5 w-5 text-txt-primary" />}
            title={
              locale === "bm"
                ? "Domain Rasmi Sebenar (.gov.my)"
                : "Target Production Domain (.gov.my)"
            }
          >
            {locale === "bm"
              ? `Dalam versi pengeluaran, Hakku menyambung terus ke ${mirroredUrl} melalui MyGDX & OIDC rasmi.`
              : `In production, Hakku connects directly to ${mirroredUrl} via official MyGDX APIs & OIDC deep-links.`}
          </MastheadSection>
          <MastheadSection
            icon={<Lock className="h-5 w-5 text-txt-success" />}
            title="MyDigital ID SSO Handshake"
          >
            {locale === "bm"
              ? "Atribut JPN/TIN/SSM diisi secara automatik tanpa menyimpan kata laluan pengguna."
              : "JPN/TIN/SSM attributes populate automatically with user consent and zero stored passwords."}
          </MastheadSection>
        </MastheadContent>
      </Masthead>

      {/* Unmistakable Sandbox Warning Banner */}
      <div className="border-b border-otl-warning-300 bg-bg-warning-50 px-4 py-2.5 no-print">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-body-xs font-medium text-txt-warning">
            <Tag variant="warning" size="small">
              PROTOTYPE MIRROR
            </Tag>
            <span>{t(locale, "mirrorWarning")}</span>
          </div>
          <code className="rounded bg-bg-white px-2 py-0.5 text-body-xs text-txt-black-700 border border-otl-gray-200">
            {mirroredUrl} [SIMULATION]
          </code>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-5 px-4 pt-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/workspace">
                  <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                  {t(locale, "navWorkspace")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/portals">{t(locale, "navPortals")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{portalTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>

          <Button
            variant={digitalIdProfile.authenticated ? "default-outline" : "primary-fill"}
            size="small"
            onClick={() => setMyDigitalIdDialogOpen(true)}
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-txt-primary" />
            {digitalIdProfile.authenticated
              ? `MyDigital ID: ${digitalIdProfile.nama}`
              : locale === "bm"
                ? "Sambung MyDigital ID untuk Pra-Isi"
                : "Connect MyDigital ID to Auto-Fill"}
          </Button>
        </div>

        <Callout variant="info" className="no-print">
          <CalloutTitle>
            {portalTitle} — {agencyName}
          </CalloutTitle>
          <CalloutContent>
            {locale === "bm"
              ? "Borang di bawah telah dipraisi daripada semakan Hakku anda serta profil MyDigital ID (Simulasi)."
              : "Fields below are automatically pre-populated from your latest Hakku compliance check and MyDigital ID sandbox profile."}
          </CalloutContent>
        </Callout>

        {children}
      </div>
    </div>
  );
}
