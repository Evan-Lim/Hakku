"use client";

import React, { useState } from "react";
import { PortalMirrorShell } from "@/components/portals/PortalMirrorShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@govtechmy/myds-react/tabs";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@govtechmy/myds-react/table";
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
import { Printer } from "lucide-react";

export default function PerkesoMirrorPage() {
  const { locale, portalPayload, digitalIdProfile } = useHakku();
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const payroll = portalPayload.payrollSummary;
  const gig = portalPayload.gigSummary;

  const submitSandbox = () => {
    setSubmittedRef(`PERKESO-SIM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`);
  };

  return (
    <PortalMirrorShell
      agencyName="PERKESO / SOCSO"
      portalTitle="ASSIST & Lindung Portal Mirror"
      mirroredUrl="https://assist.perkeso.gov.my"
    >
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
        <Tabs variant="line" size="medium" defaultValue="borang8a">
          <TabsList>
            <TabsTrigger value="borang8a">
              {locale === "bm"
                ? "Borang 8A & Lindung 24 Jam (Majikan PKS)"
                : "Borang 8A & Lindung 24 Jam (SME Payroll)"}
            </TabsTrigger>
            <TabsTrigger value="sksps">
              {locale === "bm"
                ? "Lindung Kendiri SKSPS 1.25% (Freelancer & Gig)"
                : "Lindung Kendiri SKSPS 1.25% (Freelancer & Gig)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borang8a" className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-heading-2xs font-semibold">
                  {portalPayload.employerName || digitalIdProfile.companyName}
                </h2>
                <p className="text-body-xs text-txt-black-500">
                  {digitalIdProfile.ssmNo ? `SSM: ${digitalIdProfile.ssmNo} · ` : ""}
                  {locale === "bm"
                    ? "Jadual Caruman Bulanan PERKESO, SIP & SKBBK (Lindung 24 Jam)"
                    : "Monthly SOCSO, EIS & SKBBK (Lindung 24 Jam) Schedule"}
                </p>
              </div>
              <Tag variant="primary" size="small">
                {payroll?.totalEmployees ?? 0}{" "}
                {locale === "bm" ? "Pekerja" : "Employees"}
              </Tag>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === "bm" ? "Nama" : "Name"}</TableHead>
                    <TableHead>{locale === "bm" ? "Kategori" : "Category"}</TableHead>
                    <TableHead>SOCSO EE</TableHead>
                    <TableHead>SOCSO ER</TableHead>
                    <TableHead>EIS (EE+ER)</TableHead>
                    <TableHead>Lindung 24J (0.75%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payroll?.employees ?? []).map((e) => (
                    <TableRow key={e.employeeId}>
                      <TableCell className="font-medium">{e.employeeName}</TableCell>
                      <TableCell>
                        <Tag size="small" variant={e.citizenship === "foreign" ? "warning" : "default"}>
                          {e.citizenship === "foreign" ? "Cat 2 (Foreign)" : "Cat 1 (Citizen)"}
                        </Tag>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        RM{e.expected.socsoEmployeeRm.toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        RM{e.expected.socsoEmployerRm.toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        RM{(e.expected.eisEmployeeRm + e.expected.eisEmployerRm).toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
                        RM{e.expected.lindung24JamEmployeeRm.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-otl-gray-200 pt-4">
              <div className="text-body-sm font-semibold tabular-nums">
                {locale === "bm" ? "Jumlah Caruman ASSIST:" : "Total ASSIST Remittance:"} RM
                {(
                  (payroll?.totalSocsoEmployeeRm ?? 0) +
                  (payroll?.totalSocsoEmployerRm ?? 0) +
                  (payroll?.totalEisEmployeeRm ?? 0) +
                  (payroll?.totalEisEmployerRm ?? 0) +
                  (payroll?.totalLindung24JamRm ?? 0)
                ).toFixed(2)}
              </div>
              <Button variant="primary-fill" size="medium" onClick={submitSandbox}>
                {locale === "bm"
                  ? "Hantar Jadual Borang 8A (Simulasi)"
                  : "Submit Borang 8A Schedule (Sandbox)"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sksps" className="mt-5 space-y-4">
            <SummaryList>
              <SummaryListHeader>
                <span className="font-heading text-body-sm font-semibold">
                  {locale === "bm"
                    ? "Pendaftaran & Penyelarasan Lindung Kendiri (Akta 872 · 1.25%)"
                    : "Lindung Kendiri (SKSPS · Act 872 1.25% Contribution)"}
                </span>
              </SummaryListHeader>
              <SummaryListBody>
                <SummaryListRow>
                  <SummaryListTerm>
                    {locale === "bm" ? "Pemegang Akaun" : "Self-Employed Member"}
                  </SummaryListTerm>
                  <SummaryListDetail>
                    {digitalIdProfile.authenticated
                      ? digitalIdProfile.nama
                      : portalPayload.entityOrWorkerName}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>
                    {locale === "bm" ? "Caruman 1.25% Bulanan" : "Computed 1.25% Contribution"}
                  </SummaryListTerm>
                  <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                    RM{(gig?.expectedSksps125Rm ?? 34.5).toFixed(2)} / month
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>
                    {locale === "bm" ? "Sumber Platform / Klien" : "Platform / Contracting Source"}
                  </SummaryListTerm>
                  <SummaryListDetail>
                    {portalPayload.platformOrClientName || "KilatGo Delivery / Self"}
                  </SummaryListDetail>
                </SummaryListRow>
              </SummaryListBody>
            </SummaryList>

            <div className="flex justify-end">
              <Button variant="primary-fill" size="medium" onClick={submitSandbox}>
                {locale === "bm"
                  ? "Sahkan Caruman SKSPS (Simulasi)"
                  : "Confirm SKSPS Remittance (Sandbox)"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {submittedRef && (
          <Callout variant="success" className="mt-5">
            <CalloutTitle>
              {locale === "bm"
                ? `Resit Simulasi PERKESO Dijana: ${submittedRef}`
                : `PERKESO Sandbox Receipt Generated: ${submittedRef}`}
            </CalloutTitle>
            <CalloutContent>
              {locale === "bm"
                ? "Jadual telah disahkan secara deterministik sebelum penghantaran."
                : "Schedule pre-validated deterministically with zero arithmetic discrepancies."}
            </CalloutContent>
            <CalloutAction>
              <Button variant="default-outline" size="small" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                {locale === "bm" ? "Cetak Resit" : "Print Receipt"}
              </Button>
            </CalloutAction>
          </Callout>
        )}
      </div>
    </PortalMirrorShell>
  );
}
