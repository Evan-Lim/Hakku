"use client";

import React, { useState } from "react";
import { PortalMirrorShell } from "@/components/portals/PortalMirrorShell";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import {
  SummaryList,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "@govtechmy/myds-react/summary-list";
import { Callout, CalloutAction, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { useHakku } from "@/lib/store/HakkuContext";
import { Printer, ShieldCheck } from "lucide-react";

export default function MyTaxMirrorPage() {
  const { locale, portalPayload, digitalIdProfile } = useHakku();
  const [certNo, setCertNo] = useState<string | null>(null);

  const stamp = portalPayload.stampDutySummary;

  const issueMockCertificate = () => {
    setCertNo(`SETEM-MYTAX-SIM-${Math.floor(100000 + Math.random() * 899999)}`);
  };

  return (
    <PortalMirrorShell
      agencyName="LHDN HASiL & SSM"
      portalTitle="MyTax e-Duti Setem & SSM BizTrust Mirror"
      mirroredUrl="https://mytax.hasil.gov.my"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-otl-gray-200 pb-3">
            <h2 className="font-heading text-heading-2xs font-semibold">
              {locale === "bm"
                ? "Borang Taksiran Kendiri e-Duti Setem (2026)"
                : "2026 e-Duti Setem Self-Assessment Filing"}
            </h2>
            {stamp?.pkpsAmnestyEligible && (
              <Tag variant="warning" size="small">
                PKPS Amnesty Eligible (Before 31 Dec 2026)
              </Tag>
            )}
          </div>

          <div className="mt-4">
            <SummaryList>
              <SummaryListHeader>
                <span className="font-heading text-body-sm font-semibold">
                  {locale === "bm" ? "Maklumat Instrumen Pra-Isi" : "Pre-Filled Instrument Details"}
                </span>
              </SummaryListHeader>
              <SummaryListBody>
                <SummaryListRow>
                  <SummaryListTerm>Taxpayer / TIN</SummaryListTerm>
                  <SummaryListDetail className="tabular-nums">
                    {digitalIdProfile.nama} · {digitalIdProfile.tin}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Instrument Category</SummaryListTerm>
                  <SummaryListDetail>
                    {stamp?.instrumentType === "employment_contract"
                      ? "First Schedule Item 4 — Employment Contract"
                      : "First Schedule Item 49(a) — Commercial / Workspace Lease"}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Monthly Salary / Rent</SummaryListTerm>
                  <SummaryListDetail className="tabular-nums">
                    RM{(stamp?.monthlyAmountRm ?? 4500).toFixed(2)}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Assessed Principal + Copy Duty</SummaryListTerm>
                  <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                    RM{(stamp?.totalStampDutyRm ?? 0).toFixed(2)}
                  </SummaryListDetail>
                </SummaryListRow>
              </SummaryListBody>
            </SummaryList>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="primary-fill" size="medium" onClick={issueMockCertificate}>
              {locale === "bm"
                ? "Jana Pratonton Sijil Setem (Simulasi)"
                : "Generate Prototype Sijil Setem"}
            </Button>
          </div>

          {certNo && (
            <Callout variant="success" className="mt-5">
              <CalloutTitle>
                {locale === "bm"
                  ? `Sijil Setem Prototip Dijana: ${certNo}`
                  : `Prototype Stamp Certificate Issued: ${certNo}`}
              </CalloutTitle>
              <CalloutContent>
                {stamp?.pkpsAmnestyEligible
                  ? "Tagged under PKPS Special Voluntary Disclosure (Penalty Waived until 31 Dec 2026)."
                  : "Standard e-Duti Setem self-assessment endorsement ready."}
              </CalloutContent>
              <CalloutAction>
                <Button variant="default-outline" size="small" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  Print Certificate
                </Button>
              </CalloutAction>
            </Callout>
          )}
        </div>

        {/* SSM BizTrust Entity Card */}
        <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-otl-gray-200 pb-3">
            <ShieldCheck className="h-5 w-5 text-txt-success" />
            <h3 className="font-heading text-body-md font-semibold">
              SSM BizTrust Verification (Mirror)
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-body-sm text-txt-black-700">
            <p>
              <strong className="text-txt-black-900">Entity:</strong>{" "}
              {digitalIdProfile.companyName || portalPayload.entityOrWorkerName}
            </p>
            <p className="tabular-nums">
              <strong className="text-txt-black-900">Reg No:</strong>{" "}
              {digitalIdProfile.ssmNo || "202303112940 (KT0548291-U)"}
            </p>
            <Tag variant="success" size="small" dot>
              Active Entity (Sandbox Verified)
            </Tag>
            <p className="pt-2 text-body-xs text-txt-black-500">
              {locale === "bm"
                ? "Dalam produksi, status SSM disahkan terus melalui MyDigital ID bagi pemilik tunggal & syarikat PKS."
                : "In production, SSM registration status syncs automatically upon MyDigital ID sign-in for sole proprietors & SMEs."}
            </p>
          </div>
        </div>
      </div>
    </PortalMirrorShell>
  );
}
