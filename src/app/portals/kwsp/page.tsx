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

export default function KwspMirrorPage() {
  const { locale, portalPayload, digitalIdProfile } = useHakku();
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const payroll = portalPayload.payrollSummary;
  const gig = portalPayload.gigSummary;

  const generateReceipt = () => {
    setReceiptId(`KWSP-SIM-${Math.floor(1000000 + Math.random() * 8999999)}`);
  };

  return (
    <PortalMirrorShell
      agencyName="KWSP / EPF"
      portalTitle="i-Akaun & i-Saraan Portal Mirror"
      mirroredUrl="https://www.kwsp.gov.my"
    >
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
        <Tabs variant="line" size="medium" defaultValue="boranga">
          <TabsList>
            <TabsTrigger value="boranga">
              {locale === "bm"
                ? "Borang A Majikan (Jadual Ketiga + 2% Asing)"
                : "Employer Borang A (Third Schedule + 2% Foreign)"}
            </TabsTrigger>
            <TabsTrigger value="isaraan">
              {locale === "bm"
                ? "i-Saraan Pekerja Bebas (Padanan 20%)"
                : "i-Saraan Self-Employed (20% Gov Match)"}
            </TabsTrigger>
            <TabsTrigger value="workercheck">
              {locale === "bm"
                ? "Semakan Penyata Pekerja"
                : "Worker Contribution Verification"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boranga" className="mt-5 space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === "bm" ? "Nama Staf" : "Employee"}</TableHead>
                    <TableHead>{locale === "bm" ? "Peraturan" : "Rule Applied"}</TableHead>
                    <TableHead>Employee Share</TableHead>
                    <TableHead>Employer Share</TableHead>
                    <TableHead>Total KWSP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payroll?.employees ?? []).map((e) => (
                    <TableRow key={e.employeeId}>
                      <TableCell className="font-medium">{e.employeeName}</TableCell>
                      <TableCell>
                        <Tag size="small" variant={e.citizenship === "foreign" ? "primary" : "default"}>
                          {e.citizenship === "foreign"
                            ? "Part F (2% + 2% Oct 2025)"
                            : "Third Schedule Part A"}
                        </Tag>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        RM{e.expected.epfEmployeeRm.toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        RM{e.expected.epfEmployerRm.toFixed(2)}
                      </TableCell>
                      <TableCell className="tabular-nums font-semibold">
                        RM{(e.expected.epfEmployeeRm + e.expected.epfEmployerRm).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-otl-gray-200 pt-4">
              <div className="text-body-sm font-semibold tabular-nums">
                {locale === "bm" ? "Jumlah Borang A:" : "Total Borang A Submission:"} RM
                {(
                  (payroll?.totalEpfEmployeeRm ?? 0) + (payroll?.totalEpfEmployerRm ?? 0)
                ).toFixed(2)}
              </div>
              <Button variant="primary-fill" size="medium" onClick={generateReceipt}>
                {locale === "bm"
                  ? "Lulus & Hantar Borang A (Simulasi)"
                  : "Approve & Submit Borang A (Sandbox)"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="isaraan" className="mt-5 space-y-4">
            <SummaryList>
              <SummaryListHeader>
                <span className="font-heading text-body-sm font-semibold">
                  {locale === "bm"
                    ? "Penjejak Caruman Sukarela & Padanan Kerajaan i-Saraan"
                    : "i-Saraan Voluntary Retirement & 20% Matching Tracker"}
                </span>
              </SummaryListHeader>
              <SummaryListBody>
                <SummaryListRow>
                  <SummaryListTerm>
                    {locale === "bm" ? "Ahli" : "Member Name"}
                  </SummaryListTerm>
                  <SummaryListDetail>
                    {digitalIdProfile.authenticated
                      ? digitalIdProfile.nama
                      : portalPayload.entityOrWorkerName}
                  </SummaryListDetail>
                </SummaryListRow>
                <SummaryListRow>
                  <SummaryListTerm>
                    {locale === "bm" ? "Anggaran Padanan Kerajaan (20%)" : "Estimated 20% Gov Match"}
                  </SummaryListTerm>
                  <SummaryListDetail className="tabular-nums font-semibold text-txt-success">
                    RM{(gig?.iSaraanMatchRm ?? 360).toFixed(2)}
                  </SummaryListDetail>
                </SummaryListRow>
              </SummaryListBody>
            </SummaryList>
            <div className="flex justify-end">
              <Button variant="primary-fill" size="medium" onClick={generateReceipt}>
                {locale === "bm"
                  ? "Simulasi Caruman i-Saraan"
                  : "Simulate i-Saraan Top-Up"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="workercheck" className="mt-5 space-y-4">
            {payroll?.employees?.[0] && (
              <SummaryList>
                <SummaryListHeader>
                  <span className="font-heading text-body-sm font-semibold">
                    {locale === "bm"
                      ? "Rekod Caruman Pekerja: Jangkaan Hakku vs Akaun"
                      : "Employee Statutory Check: Expected vs Statement"}
                  </span>
                </SummaryListHeader>
                <SummaryListBody>
                  <SummaryListRow>
                    <SummaryListTerm>Employee Name</SummaryListTerm>
                    <SummaryListDetail>
                      {payroll.employees[0].employeeName}
                    </SummaryListDetail>
                  </SummaryListRow>
                  <SummaryListRow>
                    <SummaryListTerm>Expected Employee Share</SummaryListTerm>
                    <SummaryListDetail className="tabular-nums">
                      RM{payroll.employees[0].expected.epfEmployeeRm.toFixed(2)}
                    </SummaryListDetail>
                  </SummaryListRow>
                  <SummaryListRow>
                    <SummaryListTerm>Expected Employer Share</SummaryListTerm>
                    <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                      RM{payroll.employees[0].expected.epfEmployerRm.toFixed(2)}
                    </SummaryListDetail>
                  </SummaryListRow>
                </SummaryListBody>
              </SummaryList>
            )}
          </TabsContent>
        </Tabs>

        {receiptId && (
          <Callout variant="success" className="mt-5">
            <CalloutTitle>
              {locale === "bm"
                ? `Pengesahan Simulasi KWSP: ${receiptId}`
                : `KWSP Sandbox Confirmation: ${receiptId}`}
            </CalloutTitle>
            <CalloutContent>
              {locale === "bm"
                ? "Pengiraan Jadual Ketiga & 2% pekerja asing telah dipraisi dengan tepat."
                : "Third Schedule and non-citizen 2% allocations pre-filled accurately."}
            </CalloutContent>
            <CalloutAction>
              <Button variant="default-outline" size="small" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
            </CalloutAction>
          </Callout>
        )}
      </div>
    </PortalMirrorShell>
  );
}
