"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutAction, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@govtechmy/myds-react/table";
import { useHakku } from "@/lib/store/HakkuContext";
import { ArrowRight, Cpu, Layers, Lock, ShieldCheck } from "lucide-react";

export default function VisionPage() {
  const { locale, setMyDigitalIdDialogOpen } = useHakku();

  return (
    <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-8 md:px-6">
      <div className="space-y-3 border-b border-otl-gray-200 pb-6">
        <Tag variant="primary" size="medium" mode="pill">
          {locale === "bm"
            ? "Pelan Penganjur & Pelabur · Hakku Production Roadmap"
            : "Organiser & Investor Architecture · Hakku Production Vision"}
        </Tag>
        <h1 className="font-heading text-heading-sm font-semibold text-txt-black-900 md:text-heading-md">
          {locale === "bm"
            ? "Daripada Simulasi Prototip ke Pautan Langsung MyDigital ID & Portal Kerajaan"
            : "From Prototype Mirror to Live MyDigital ID & Official Government Rails"}
        </h1>
        <p className="max-w-3xl text-body-md text-txt-black-700">
          {locale === "bm"
            ? "Hari ini, Hakku membuktikan pengalaman penuh tanpa ralat melalui cermin portal rasmi. Dalam fasa pengeluaran, Hakku bertindak sebagai lapisan pematuhan pintar antara rakyat, perniagaan, MyDigital ID, dan sistem rasmi kerajaan Malaysia."
            : "Today, Hakku proves the exact zero-retyping citizen & SME experience via interactive portal mirrors. In production, Hakku integrates MyDigital ID OIDC and MyGDX to connect directly with official Malaysian government apps and portals."}
        </p>
      </div>

      {/* Three-Layer Architecture */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-txt-primary">
            <Lock className="h-5 w-5" />
            <h2 className="font-heading text-heading-2xs font-semibold">
              1. MyDigital ID Identity Layer
            </h2>
          </div>
          <p className="mt-3 text-body-sm text-txt-black-700">
            Standard <strong>OAuth 2.0 / OpenID Connect (PKCE)</strong> handshake via MyDigital ID SSO. Zero passwords stored; instant JPN-verified NRIC, Name, LHDN TIN, and SSM ownership binding.
          </p>
        </div>

        <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-txt-success">
            <Cpu className="h-5 w-5" />
            <h2 className="font-heading text-heading-2xs font-semibold">
              2. YTL ILMU Sovereign AI + Math Core
            </h2>
          </div>
          <p className="mt-3 text-body-sm text-txt-black-700">
            <code>ilmu-vision-v1.3</code>, <code>ilmu-asr-v4.2</code>, <code>bge-m3</code>,{" "}
            <code>ilmu-v3.1</code> & <code>ilmu-tts-v2</code> run 100% onshore in Malaysia, paired with deterministic TypeScript engines so Ringgit figures never hallucinate.
          </p>
        </div>

        <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-txt-primary">
            <Layers className="h-5 w-5" />
            <h2 className="font-heading text-heading-2xs font-semibold">
              3. MyGDX & Official Agency Sync
            </h2>
          </div>
          <p className="mt-3 text-body-sm text-txt-black-700">
            User-consented 2-way exchange across <strong>PERKESO ASSIST</strong>,{" "}
            <strong>KWSP i-Akaun / i-Saraan</strong>, <strong>JTKSM WFW</strong>,{" "}
            <strong>Gig Workers Tribunal</strong>, and <strong>MyTax e-Duti Setem</strong>.
          </p>
        </div>
      </div>

      {/* Prototype vs Production Comparison Table */}
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
        <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
          Prototype Today vs. Production Roadmap
        </h2>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability Layer</TableHead>
                <TableHead>Hackathon Prototype (Today)</TableHead>
                <TableHead>Production Rollout (Post-Sandbox Onboarding)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Identity & Auth</TableCell>
                <TableCell>Interactive MyDigital ID OIDC Simulator Modal</TableCell>
                <TableCell>Live MyDigital ID SSO Developer Portal (OIDC + PKCE)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">AI Processing</TableCell>
                <TableCell>Toggleable YTL ILMU Live API / Sovereign Demo Fallback</TableCell>
                <TableCell>Dedicated YTL AI Cloud Onshore Tenant (PDPA Compliant)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Statutory Math</TableCell>
                <TableCell>Full 2026 Deterministic Engines (EA 1955, EPF, PERKESO, Act 872, Stamp Act)</TableCell>
                <TableCell>Continuous Gazetted Table Updates + Bulk SME Payroll Rules</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Government Portals</TableCell>
                <TableCell>5 MYDS-Compliant Interactive Portal Mirrors with 1-Click Pre-Fill</TableCell>
                <TableCell>Direct Deep-Links & MyGDX Agency API Submissions</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Investor Business Model */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-lg border border-otl-gray-200 bg-bg-washed p-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-body-md font-semibold">Workers & Gig Riders</span>
            <Tag variant="success" size="small">Free Core</Tag>
          </div>
          <p className="mt-2 text-body-sm text-txt-black-700">
            Free payslip & Act 872 compliance checks + BM/Manglish voice guidance. Optional RM5–RM9/mo Evidence Vault & Priority Dossier export.
          </p>
        </div>

        <div className="rounded-lg border border-otl-gray-200 bg-bg-washed p-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-body-md font-semibold">Freelance Business Owners</span>
            <Tag variant="primary" size="small">RM19–RM39 / mo</Tag>
          </div>
          <p className="mt-2 text-body-sm text-txt-black-700">
            Act 872 SOW & invoice 7-day tracker, PERKESO Lindung Kendiri + KWSP i-Saraan optimizer, and MyTax e-Duti Setem automation.
          </p>
        </div>

        <div className="rounded-lg border border-otl-gray-200 bg-bg-washed p-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-body-md font-semibold">SME Employers (B2B SaaS)</span>
            <Tag variant="warning" size="small">RM79–RM299 / mo</Tag>
          </div>
          <p className="mt-2 text-body-sm text-txt-black-700">
            Pre-payday compliance shield across local & foreign staff, Borang A / 8A preparation, and contract/lease PKPS monitoring.
          </p>
        </div>
      </div>

      <Callout variant="info">
        <CalloutTitle>Malaysian Market Reach</CalloutTitle>
        <CalloutContent>
          Addresses 1.64M Act 872 gig &amp; freelance workers, 1.1M+ Malaysian MSMEs, and Malaysia&apos;s salaried workforce on one sovereign MYDS platform.
        </CalloutContent>
        <CalloutAction className="flex-wrap gap-2">
          <Button variant="primary-outline" size="small" onClick={() => setMyDigitalIdDialogOpen(true)}>
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Test MyDigital ID Modal
          </Button>
          <Button asChild variant="primary-fill" size="small">
            <Link href="/portals">
              Try Portal Mirrors
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CalloutAction>
      </Callout>
    </div>
  );
}
