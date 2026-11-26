"use client";

import React, { useState } from "react";
import { PortalMirrorShell } from "@/components/portals/PortalMirrorShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@govtechmy/myds-react/tabs";
import { Button } from "@govtechmy/myds-react/button";
import { Input } from "@govtechmy/myds-react/input";
import { Label } from "@govtechmy/myds-react/label";
import { TextArea } from "@govtechmy/myds-react/textarea";
import { Callout, CalloutAction, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import {
  SummaryList,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "@govtechmy/myds-react/summary-list";
import { useHakku } from "@/lib/store/HakkuContext";
import { Printer } from "lucide-react";

export default function KesumaMirrorPage() {
  const { locale, persona, portalPayload, digitalIdProfile } = useHakku();
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [notes, setNotes] = useState(
    portalPayload.draftedNotice?.bodyEn ||
      "Prepared via Hakku deterministic statutory check and verified MyDigital ID sandbox profile."
  );

  const defaultTab = persona === "freelancer" ? "tribunal" : "wfw";
  const claimAmt =
    defaultTab === "tribunal"
      ? portalPayload.gigSummary?.totalClaimableRm ?? 1685
      : portalPayload.payrollSummary?.underpaymentVarianceRm ?? 0;

  const submitCase = (prefix: string) => {
    setTicketRef(`${prefix}-${Math.floor(10000 + Math.random() * 89999)}-2026`);
  };

  return (
    <PortalMirrorShell
      agencyName="KESUMA / JTKSM"
      portalTitle="Working for Workers (WFW) & Act 872 Gig Tribunal Mirror"
      mirroredUrl="https://workforworkers.com.my"
    >
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
        <Tabs variant="line" size="medium" defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="tribunal">
              {locale === "bm"
                ? "Tribunal Pekerja Gig (Akta 872)"
                : "Gig Workers Tribunal e-Filing (Act 872)"}
            </TabsTrigger>
            <TabsTrigger value="wfw">
              {locale === "bm"
                ? "JTKSM Working for Workers (WFW)"
                : "JTKSM Working for Workers (WFW)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tribunal" className="mt-5 space-y-4">
            <SummaryList>
              <SummaryListHeader>
                <span className="font-heading text-body-sm font-semibold">
                  {locale === "bm"
                    ? "Butiran Pemfailan Kendiri Tribunal Pekerja Gig"
                    : "Gig Workers Tribunal Self-Representation Filing (Act 872)"}
                </span>
              </SummaryListHeader>
              <SummaryListBody>
                <SummaryListRow>
                  <SummaryListTerm>Claimant (MyDigital ID)</SummaryListTerm>
                  <SummaryListDetail>
                    {digitalIdProfile.authenticated
                      ? `${digitalIdProfile.nama} (${digitalIdProfile.maskedNric})`
                      : portalPayload.entityOrWorkerName}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Contracting Entity / Platform</SummaryListTerm>
                  <SummaryListDetail>
                    {portalPayload.platformOrClientName || "Client / Platform Entity"}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Overdue / Suspension Days</SummaryListTerm>
                  <SummaryListDetail className="tabular-nums">
                    {portalPayload.gigSummary?.daysOverdue ?? 0} overdue ·{" "}
                    {portalPayload.gigSummary?.suspensionDays ?? 0} suspension days
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>Computed Claimable Amount</SummaryListTerm>
                  <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                    RM{claimAmt.toFixed(2)}
                  </SummaryListDetail>
                </SummaryListRow>
              </SummaryListBody>
            </SummaryList>

            <div>
              <Label size="small" className="mb-1 block">
                {locale === "bm" ? "Ringkasan Tuntutan" : "Claim Narrative"}
              </Label>
              <TextArea
                size="medium"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="primary-fill" size="medium" onClick={() => submitCase("TPG-MY")}>
                {locale === "bm"
                  ? "Failkan Dossier Tribunal (Simulasi)"
                  : "Submit Tribunal Dossier (Sandbox)"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wfw" className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Nama Pekerja" : "Worker Name"}
                </Label>
                <Input
                  size="medium"
                  readOnly
                  value={
                    digitalIdProfile.authenticated
                      ? digitalIdProfile.nama
                      : portalPayload.entityOrWorkerName
                  }
                />
              </div>
              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Nama Majikan" : "Employer"}
                </Label>
                <Input
                  size="medium"
                  readOnly
                  value={portalPayload.employerName || "Employer Sdn Bhd"}
                />
              </div>
            </div>

            <div>
              <Label size="small" className="mb-1 block">
                {locale === "bm"
                  ? "Ringkasan Aduan & Varians Gaji (RM)"
                  : "WFW Summary & Deterministic Wage Variance"}
              </Label>
              <TextArea
                size="medium"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="primary-fill" size="medium" onClick={() => submitCase("WFW-JTKSM")}>
                {locale === "bm"
                  ? "Hantar Laporan WFW (Simulasi)"
                  : "Submit WFW Report (Sandbox)"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {ticketRef && (
          <Callout variant="success" className="mt-5">
            <CalloutTitle>
              {locale === "bm"
                ? `Nombor Rujukan Simulasi Dijana: ${ticketRef}`
                : `Sandbox Case Reference Issued: ${ticketRef}`}
            </CalloutTitle>
            <CalloutContent>
              {locale === "bm"
                ? "Draf sokongan dan jadual pengiraan sedia untuk dicetak."
                : "Pre-validated schedule and bilingual summary ready for printing."}
            </CalloutContent>
            <CalloutAction>
              <Button variant="default-outline" size="small" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Dossier
              </Button>
            </CalloutAction>
          </Callout>
        )}
      </div>
    </PortalMirrorShell>
  );
}
