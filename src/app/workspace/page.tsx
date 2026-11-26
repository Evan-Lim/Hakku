"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@govtechmy/myds-react/tabs";
import { Button } from "@govtechmy/myds-react/button";
import { Input } from "@govtechmy/myds-react/input";
import { Label } from "@govtechmy/myds-react/label";
import { Checkbox } from "@govtechmy/myds-react/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@govtechmy/myds-react/select";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import {
  SummaryList,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "@govtechmy/myds-react/summary-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@govtechmy/myds-react/table";
import { useHakku } from "@/lib/store/HakkuContext";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";
import { auditEmployeePayroll } from "@/lib/engines/payrollEngine";
import { auditGigCase } from "@/lib/engines/gigEngine";
import { calculateStampDuty2026 } from "@/lib/engines/stampDutyEngine";
import {
  GigCaseInput,
  PayrollEmployeeInput,
  StampDutyInput,
  UserPersona,
} from "@/lib/engines/types";
import { MultimodalIntakePanel } from "@/components/workspace/MultimodalIntakePanel";
import { StampDutyPanel } from "@/components/workspace/StampDutyPanel";
import { DraftingAndRagStudio } from "@/components/workspace/DraftingAndRagStudio";
import { Plus, Trash2 } from "lucide-react";

function WorkspaceInner() {
  const searchParams = useSearchParams();
  const {
    locale,
    persona,
    setPersona,
    activeScenarioId,
    setActiveScenarioId,
  } = useHakku();

  const initialScenario =
    DEMO_SCENARIOS.find((s) => s.id === (searchParams.get("scenario") || activeScenarioId)) ??
    DEMO_SCENARIOS[2];

  const [entityName, setEntityName] = useState(initialScenario.entityName);
  const [counterpartyName, setCounterpartyName] = useState(
    initialScenario.counterpartyName
  );

  const [employees, setEmployees] = useState<PayrollEmployeeInput[]>(
    initialScenario.payrollEmployees ??
      DEMO_SCENARIOS.find((s) => s.id === "sme-razak")!.payrollEmployees!
  );

  const [gigCase, setGigCase] = useState<GigCaseInput>(
    initialScenario.gigCase ??
      DEMO_SCENARIOS.find((s) => s.id === "freelancer-hafiz")!.gigCase!
  );

  const [stampDuty, setStampDuty] = useState<StampDutyInput>(
    initialScenario.stampDuty ??
      DEMO_SCENARIOS.find((s) => s.id === "sme-razak")!.stampDuty!
  );

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserPersona | null;
    if (roleParam && ["freelancer", "sme", "worker"].includes(roleParam)) {
      setPersona(roleParam);
    }
  }, [searchParams, setPersona]);

  const applyScenario = (scenarioId: string) => {
    const sc = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;
    setActiveScenarioId(sc.id);
    setPersona(sc.persona);
    setEntityName(sc.entityName);
    setCounterpartyName(sc.counterpartyName);
    if (sc.payrollEmployees) setEmployees(sc.payrollEmployees);
    if (sc.gigCase) setGigCase(sc.gigCase);
    if (sc.stampDuty) setStampDuty(sc.stampDuty);
  };

  const payrollAudits = useMemo(
    () => employees.map(auditEmployeePayroll),
    [employees]
  );

  const gigResult = useMemo(() => auditGigCase(gigCase), [gigCase]);

  const stampResult = useMemo(
    () => calculateStampDuty2026(stampDuty),
    [stampDuty]
  );

  const workerLeadAudit = payrollAudits[0];

  const addSmeEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        id: `emp-${Date.now()}`,
        name: `New Staff #${prev.length + 1}`,
        citizenship: "citizen",
        ageGroup: "under_60",
        basicSalaryRm: 1800,
        fixedAllowanceRm: 150,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 0,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: false,
      },
    ]);
  };

  const updateEmployee = (
    idx: number,
    patch: Partial<PayrollEmployeeInput>
  ) => {
    setEmployees((prev) =>
      prev.map((emp, i) => (i === idx ? { ...emp, ...patch } : emp))
    );
  };

  const allFindingsText = useMemo(() => {
    if (persona === "freelancer") {
      return gigResult.findings.map((f) =>
        locale === "bm" ? `${f.titleBm}: ${f.detailBm}` : `${f.titleEn}: ${f.detailEn}`
      );
    }
    const list = payrollAudits.flatMap((a) =>
      a.findings
        .filter((f) => f.severity !== "pass")
        .map((f) =>
          locale === "bm"
            ? `${a.employeeName} — ${f.titleBm}`
            : `${a.employeeName} — ${f.titleEn}`
        )
    );
    return list.length > 0
      ? list
      : [
          locale === "bm"
            ? "Semua kiraan gaji & caruman mematuhi peraturan 2026."
            : "All payroll and statutory contributions align with 2026 guidelines.",
        ];
  }, [persona, gigResult, payrollAudits, locale]);

  const totalActionRm = useMemo(() => {
    if (persona === "freelancer") return gigResult.totalClaimableRm;
    return payrollAudits.reduce((s, a) => s + a.totalShortfallOrVarianceRm, 0);
  }, [persona, gigResult, payrollAudits]);

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-8 md:px-6">
      {/* Header + 1-Click Scenario Bar */}
      <div className="flex flex-col gap-4 border-b border-otl-gray-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-heading-sm font-semibold text-txt-black-900">
            {locale === "bm"
              ? "Hab Pematuhan Kerja & Perniagaan Hakku"
              : "Hakku Work, Freelance & SME Compliance Hub"}
          </h1>
          <p className="mt-1 text-body-sm text-txt-black-500">
            {locale === "bm"
              ? "Tukar peranan bila-bila masa atau muatkan kes demo Malaysia 2026."
              : "Switch roles anytime, scan documents or voice notes, and verify exact 2026 statutory numbers."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-xs font-medium text-txt-black-500">
            {locale === "bm" ? "Kes Demo:" : "Quick Cases:"}
          </span>
          {DEMO_SCENARIOS.map((sc) => (
            <Button
              key={sc.id}
              variant={activeScenarioId === sc.id ? "primary-fill" : "default-outline"}
              size="small"
              onClick={() => applyScenario(sc.id)}
            >
              {sc.id === "worker-aina"
                ? "Aina (Worker)"
                : sc.id === "sme-razak"
                  ? "Razak (SME)"
                  : sc.id === "freelancer-hafiz"
                    ? "Hafiz (Freelancer)"
                    : "Kumar (Gig Rider)"}
            </Button>
          ))}
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs
        variant="enclosed"
        size="medium"
        value={persona}
        onValueChange={(v) => setPersona(v as UserPersona)}
      >
        <TabsList width="full" className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          <TabsTrigger value="freelancer">
            {locale === "bm"
              ? "Perniagaan Bebas & Gig (Akta 872)"
              : "Freelance Business & Gig (Act 872)"}
          </TabsTrigger>
          <TabsTrigger value="sme">
            {locale === "bm"
              ? "Majikan PKS (Perisai Pra-Gaji)"
              : "SME Business Owner (Pre-Payday Shield)"}
          </TabsTrigger>
          <TabsTrigger value="worker">
            {locale === "bm"
              ? "Pekerja (Semakan Slip Gaji)"
              : "Full-Time Worker (Payslip Check)"}
          </TabsTrigger>
        </TabsList>

        {/* Multimodal Intake Shared Across Roles */}
        <div className="mt-5">
          <MultimodalIntakePanel
            onOcrComplete={(fields) => {
              if (typeof fields.basicSalaryRm === "number" && employees[0]) {
                updateEmployee(0, { basicSalaryRm: fields.basicSalaryRm });
              }
              if (typeof fields.amountRm === "number") {
                setGigCase((prev) => ({
                  ...prev,
                  invoiceOrPayoutAmountRm: Number(fields.amountRm),
                }));
              }
              if (typeof fields.monthlyAmountRm === "number") {
                setStampDuty((prev) => ({
                  ...prev,
                  monthlyWageOrRentRm: Number(fields.monthlyAmountRm),
                }));
              }
            }}
          />
        </div>

        {/* TRACK 1: FREELANCE BUSINESS OWNERS & GIG WORKERS */}
        <TabsContent value="freelancer" className="mt-5 space-y-5">
          <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-otl-gray-200 pb-3">
              <div>
                <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                  {locale === "bm"
                    ? "Pembantu Hak Pekerja Bebas & Gig (Akta 872)"
                    : "Freelance & Gig Safeguard (Gig Workers Act 2025 / Act 872)"}
                </h2>
                <p className="text-body-xs text-txt-black-500">
                  {locale === "bm"
                    ? "Semak perjanjian perkhidmatan, tunggakan melebihi 7 hari, penggantungan 14 hari + elaun 50%, PERKESO 1.25% & KWSP i-Saraan."
                    : "Verify written SOW terms, 7-day invoice/payout benchmarks, 14-day suspension cap + 50% allowance, 1.25% Lindung Kendiri & i-Saraan."}
                </p>
              </div>
              <Tag variant="primary" size="medium">
                {locale === "bm" ? "Jumlah Tuntutan:" : "Actionable Amount:"} RM
                {gigResult.totalClaimableRm.toFixed(2)}
              </Tag>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Jenis Profil" : "Work Mode"}
                </Label>
                <Select
                  variant="outline"
                  size="medium"
                  value={gigCase.roleType}
                  onValueChange={(v) =>
                    setGigCase({
                      ...gigCase,
                      roleType: v as GigCaseInput["roleType"],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelance_business">
                      <span>
                        {locale === "bm"
                          ? "Pemilik Perniagaan Bebas / Kontraktor"
                          : "Freelance Business Owner / Creative"}
                      </span>
                    </SelectItem>
                    <SelectItem value="gig_rider">
                      <span>
                        {locale === "bm"
                          ? "Penunggang / Pemandu Platform Gig"
                          : "Platform E-Hailing / P-Hailing Rider"}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Klien / Platform" : "Client / Platform"}
                </Label>
                <Input
                  size="medium"
                  value={gigCase.platformOrClientName}
                  onChange={(e) => {
                    setGigCase({ ...gigCase, platformOrClientName: e.target.value });
                    setCounterpartyName(e.target.value);
                  }}
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Invois / Bayaran Tertunggak (RM)" : "Invoice / Payout Due (RM)"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  value={gigCase.invoiceOrPayoutAmountRm}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      invoiceOrPayoutAmountRm: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Hari Sejak Kerja Siap" : "Days Since Work Completed"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  value={gigCase.daysSinceWorkCompleted}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      daysSinceWorkCompleted: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Pendapatan Kasar Bulanan (RM)" : "Monthly Gross Earnings (RM)"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  value={gigCase.monthlyGrossGigIncomeRm}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      monthlyGrossGigIncomeRm: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Caruman Tahunan i-Saraan (RM)" : "Annual i-Saraan Contributed (RM)"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  value={gigCase.annualISaraanContributedRm}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      annualISaraanContributedRm: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Tempoh Penggantungan (Hari)" : "Suspension Days Elapsed"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  disabled={!gigCase.isSuspended}
                  value={gigCase.suspensionDaysElapsed}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      suspensionDaysElapsed: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>

              <div>
                <Label size="small" className="mb-1 block">
                  {locale === "bm" ? "Purata Pendapatan Harian (RM)" : "Avg Daily Earnings (RM)"}
                </Label>
                <Input
                  size="medium"
                  type="number"
                  min={0}
                  disabled={!gigCase.isSuspended}
                  value={gigCase.averageDailyEarningsRm}
                  onChange={(e) =>
                    setGigCase({
                      ...gigCase,
                      averageDailyEarningsRm: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>
            </div>

            {/* Act 872 Written Contract & Suspension Toggles */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-otl-gray-200 pt-4 text-body-xs text-txt-black-700">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={gigCase.hasWrittenAgreement}
                  onCheckedChange={(c) =>
                    setGigCase({ ...gigCase, hasWrittenAgreement: Boolean(c) })
                  }
                />
                <span>{locale === "bm" ? "Perjanjian Bertulis" : "Written SOW"}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={gigCase.statesFeeFormula}
                  onCheckedChange={(c) =>
                    setGigCase({ ...gigCase, statesFeeFormula: Boolean(c) })
                  }
                />
                <span>{locale === "bm" ? "Kadar Bayaran Jelas" : "Fee Formula Stated"}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={gigCase.statesPaymentTimeline}
                  onCheckedChange={(c) =>
                    setGigCase({ ...gigCase, statesPaymentTimeline: Boolean(c) })
                  }
                />
                <span>{locale === "bm" ? "Tarikh Akhir Bayaran" : "Payment Timeline Stated"}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={gigCase.isSuspended}
                  onCheckedChange={(c) =>
                    setGigCase({ ...gigCase, isSuspended: Boolean(c) })
                  }
                />
                <span>
                  {locale === "bm" ? "Akaun Sedang Digantung" : "Account Currently Suspended"}
                </span>
              </label>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {gigResult.findings.map((f) => (
                <Callout
                  key={f.code}
                  variant={
                    f.severity === "pass"
                      ? "success"
                      : f.severity === "action_needed"
                        ? "danger"
                        : f.severity === "warning"
                          ? "warning"
                          : "info"
                  }
                >
                  <CalloutTitle>{locale === "bm" ? f.titleBm : f.titleEn}</CalloutTitle>
                  <CalloutContent>
                    <span>{locale === "bm" ? f.detailBm : f.detailEn}</span>
                    <span className="mt-1 block text-body-xs opacity-80">
                      {f.citation.act} · {f.citation.section}
                    </span>
                  </CalloutContent>
                </Callout>
              ))}
            </div>
          </div>

          <StampDutyPanel
            value={stampDuty}
            onChange={setStampDuty}
            result={stampResult}
          />
        </TabsContent>

        {/* TRACK 2: SME BUSINESS OWNERS (PRE-PAYDAY COMPLIANCE SHIELD) */}
        <TabsContent value="sme" className="mt-5 space-y-5">
          <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-otl-gray-200 pb-3">
              <div>
                <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                  {locale === "bm"
                    ? "Perisai Pematuhan Pra-Gaji PKS"
                    : "SME Pre-Payday Compliance Shield"}
                </h2>
                <p className="text-body-xs text-txt-black-500">
                  {locale === "bm"
                    ? "Sahkan jadual KWSP (termasuk 2% pekerja asing), PERKESO, SIP, dan Lindung 24 Jam sebelum membayar gaji."
                    : "Validate RM1,700 basic floor, EPF Third Schedule + mandatory 2% foreign-worker EPF, SOCSO, EIS, and Lindung 24 Jam before payday."}
                </p>
              </div>
              <Button variant="primary-outline" size="small" onClick={addSmeEmployee}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {locale === "bm" ? "Tambah Staf" : "Add Employee"}
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === "bm" ? "Pekerja" : "Employee"}</TableHead>
                    <TableHead>{locale === "bm" ? "Warga" : "Status"}</TableHead>
                    <TableHead>{locale === "bm" ? "Pokok (RM)" : "Basic (RM)"}</TableHead>
                    <TableHead>{locale === "bm" ? "Elaun (RM)" : "Allowance"}</TableHead>
                    <TableHead>OT (Hrs)</TableHead>
                    <TableHead>KWSP EE/ER</TableHead>
                    <TableHead>PERKESO/EIS</TableHead>
                    <TableHead>Lindung 24J</TableHead>
                    <TableHead>{locale === "bm" ? "Skor" : "Status"}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp, idx) => {
                    const audit = payrollAudits[idx];
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <Input
                            size="small"
                            className="min-w-[160px]"
                            value={emp.name}
                            onChange={(e) => updateEmployee(idx, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            variant="outline"
                            size="small"
                            value={emp.citizenship}
                            onValueChange={(v) =>
                              updateEmployee(idx, {
                                citizenship: v as "citizen" | "foreign",
                              })
                            }
                          >
                            <SelectTrigger className="w-[105px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="citizen">
                                <span>Local</span>
                              </SelectItem>
                              <SelectItem value="foreign">
                                <span>Foreign</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            size="small"
                            type="number"
                            className="w-[92px] tabular-nums"
                            value={emp.basicSalaryRm}
                            onChange={(e) =>
                              updateEmployee(idx, {
                                basicSalaryRm: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            size="small"
                            type="number"
                            className="w-[82px] tabular-nums"
                            value={emp.fixedAllowanceRm}
                            onChange={(e) =>
                              updateEmployee(idx, {
                                fixedAllowanceRm: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            size="small"
                            type="number"
                            className="w-[68px] tabular-nums"
                            value={emp.normalOtHours}
                            onChange={(e) =>
                              updateEmployee(idx, {
                                normalOtHours: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="tabular-nums text-body-xs">
                          RM{audit.expected.epfEmployeeRm} / RM{audit.expected.epfEmployerRm}
                        </TableCell>
                        <TableCell className="tabular-nums text-body-xs">
                          RM
                          {(
                            audit.expected.socsoEmployeeRm + audit.expected.eisEmployeeRm
                          ).toFixed(2)}{" "}
                          / RM
                          {(
                            audit.expected.socsoEmployerRm + audit.expected.eisEmployerRm
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="tabular-nums text-body-xs">
                          RM{audit.expected.lindung24JamEmployeeRm.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Tag
                            size="small"
                            variant={
                              audit.totalShortfallOrVarianceRm > 0
                                ? "danger"
                                : "success"
                            }
                          >
                            {audit.totalShortfallOrVarianceRm > 0
                              ? `Gap RM${audit.totalShortfallOrVarianceRm.toFixed(0)}`
                              : "Ready"}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          {employees.length > 1 && (
                            <Button
                              variant="danger-ghost"
                              size="small"
                              iconOnly
                              aria-label="Remove staff"
                              onClick={() =>
                                setEmployees((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {payrollAudits
                .flatMap((a) =>
                  a.findings
                    .filter((f) => f.severity !== "pass")
                    .map((f) => ({ staff: a.employeeName, f }))
                )
                .slice(0, 4)
                .map(({ staff, f }, idx) => (
                  <Callout
                    key={`${staff}-${f.code}-${idx}`}
                    variant={
                      f.severity === "action_needed"
                        ? "danger"
                        : f.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    <CalloutTitle>
                      {staff}: {locale === "bm" ? f.titleBm : f.titleEn}
                    </CalloutTitle>
                    <CalloutContent>
                      {locale === "bm" ? f.detailBm : f.detailEn}
                    </CalloutContent>
                  </Callout>
                ))}
            </div>
          </div>

          <StampDutyPanel
            value={stampDuty}
            onChange={setStampDuty}
            result={stampResult}
          />
        </TabsContent>

        {/* TRACK 3: FULL-TIME & CONTRACT WORKERS */}
        <TabsContent value="worker" className="mt-5 space-y-5">
          {employees[0] && workerLeadAudit && (
            <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-otl-gray-200 pb-3">
                <div>
                  <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
                    {locale === "bm"
                      ? "Semakan Slip Gaji & Caruman Pintar"
                      : "Smart Payroll & Payslip Check"}
                  </h2>
                  <p className="text-body-xs text-txt-black-500">
                    {locale === "bm"
                      ? "Bandingkan butiran slip gaji anda dengan formula Akta Kerja 1955, KWSP & PERKESO 2026."
                      : "Compare your payslip against exact 2026 Employment Act 1955, EPF, PERKESO & Lindung 24 Jam math."}
                  </p>
                </div>
                <Tag
                  size="medium"
                  variant={
                    workerLeadAudit.totalShortfallOrVarianceRm > 0
                      ? "danger"
                      : "success"
                  }
                >
                  {workerLeadAudit.totalShortfallOrVarianceRm > 0
                    ? `${locale === "bm" ? "Anggaran Kurang Bayar" : "Estimated Variance"}: RM${workerLeadAudit.totalShortfallOrVarianceRm.toFixed(2)}`
                    : locale === "bm"
                      ? "Gaji Mematuhi Peraturan"
                      : "Payslip Compliant"}
                </Tag>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label size="small" className="mb-1 block">
                    {locale === "bm" ? "Gaji Pokok (RM)" : "Basic Salary (RM)"}
                  </Label>
                  <Input
                    size="medium"
                    type="number"
                    value={employees[0].basicSalaryRm}
                    onChange={(e) =>
                      updateEmployee(0, {
                        basicSalaryRm: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </div>
                <div>
                  <Label size="small" className="mb-1 block">
                    {locale === "bm" ? "Elaun Tetap (RM)" : "Fixed Allowance (RM)"}
                  </Label>
                  <Input
                    size="medium"
                    type="number"
                    value={employees[0].fixedAllowanceRm}
                    onChange={(e) =>
                      updateEmployee(0, {
                        fixedAllowanceRm: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </div>
                <div>
                  <Label size="small" className="mb-1 block">
                    {locale === "bm" ? "Jam OT Biasa (1.5x)" : "Normal OT Hours (1.5x)"}
                  </Label>
                  <Input
                    size="medium"
                    type="number"
                    value={employees[0].normalOtHours}
                    onChange={(e) =>
                      updateEmployee(0, {
                        normalOtHours: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-body-xs text-txt-black-700">
                    <Checkbox
                      checked={employees[0].lindung24JamOptOut}
                      onCheckedChange={(c) =>
                        updateEmployee(0, { lindung24JamOptOut: Boolean(c) })
                      }
                    />
                    <span>
                      {locale === "bm"
                        ? "Saya telah opt-out Lindung 24 Jam"
                        : "I opted out of Lindung 24 Jam"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SummaryList>
                  <SummaryListHeader>
                    <span className="font-heading text-body-sm font-semibold">
                      {locale === "bm"
                        ? "Jangkaan Statutori vs Slip Gaji"
                        : "Statutory Expected Breakdown"}
                    </span>
                  </SummaryListHeader>
                  <SummaryListBody>
                    <SummaryListRow>
                      <SummaryListTerm>ORP / HRP (EA 1955)</SummaryListTerm>
                      <SummaryListDetail className="tabular-nums">
                        RM{workerLeadAudit.orpRm.toFixed(2)} / day · RM
                        {workerLeadAudit.hrpRm.toFixed(2)} / hr
                      </SummaryListDetail>
                    </SummaryListRow>
                    <SummaryListRow>
                      <SummaryListTerm>
                        {locale === "bm" ? "Bayaran OT Sepatutnya" : "Expected OT Pay"}
                      </SummaryListTerm>
                      <SummaryListDetail className="tabular-nums font-semibold">
                        RM{workerLeadAudit.expected.otPayRm.toFixed(2)}
                      </SummaryListDetail>
                    </SummaryListRow>
                    <SummaryListRow>
                      <SummaryListTerm>KWSP (EE / ER)</SummaryListTerm>
                      <SummaryListDetail className="tabular-nums">
                        RM{workerLeadAudit.expected.epfEmployeeRm.toFixed(2)} / RM
                        {workerLeadAudit.expected.epfEmployerRm.toFixed(2)}
                      </SummaryListDetail>
                    </SummaryListRow>
                    <SummaryListRow>
                      <SummaryListTerm>PERKESO + EIS + Lindung 24J</SummaryListTerm>
                      <SummaryListDetail className="tabular-nums">
                        EE RM
                        {(
                          workerLeadAudit.expected.socsoEmployeeRm +
                          workerLeadAudit.expected.eisEmployeeRm +
                          workerLeadAudit.expected.lindung24JamEmployeeRm
                        ).toFixed(2)}
                      </SummaryListDetail>
                    </SummaryListRow>
                    <SummaryListRow>
                      <SummaryListTerm>
                        {locale === "bm" ? "Gaji Bersih Sepatutnya" : "Expected Net Pay"}
                      </SummaryListTerm>
                      <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                        RM{workerLeadAudit.expected.netPayRm.toFixed(2)}
                      </SummaryListDetail>
                    </SummaryListRow>
                  </SummaryListBody>
                </SummaryList>

                <div className="space-y-3">
                  {workerLeadAudit.findings.map((f) => (
                    <Callout
                      key={f.code}
                      variant={
                        f.severity === "pass"
                          ? "success"
                          : f.severity === "action_needed"
                            ? "danger"
                            : f.severity === "warning"
                              ? "warning"
                              : "info"
                      }
                    >
                      <CalloutTitle>
                        {locale === "bm" ? f.titleBm : f.titleEn}
                      </CalloutTitle>
                      <CalloutContent>
                        <span>{locale === "bm" ? f.detailBm : f.detailEn}</span>
                        <span className="mt-1 block text-body-xs opacity-80">
                          {f.citation.act} · {f.citation.section}
                        </span>
                      </CalloutContent>
                    </Callout>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Drafting & RAG + Portal Sync Bridge */}
      <DraftingAndRagStudio
        partyName={entityName}
        counterpartyName={counterpartyName}
        findingsSummary={allFindingsText}
        totalAmountRm={totalActionRm}
        buildSyncPayload={(drafted) => ({
          sourcePersona: persona,
          generatedAt: new Date().toISOString(),
          entityOrWorkerName: entityName,
          employerName: persona === "sme" ? entityName : counterpartyName,
          platformOrClientName: counterpartyName,
          payrollSummary: {
            totalEmployees: payrollAudits.length,
            citizenCount: payrollAudits.filter((a) => a.citizenship === "citizen")
              .length,
            foreignCount: payrollAudits.filter((a) => a.citizenship === "foreign")
              .length,
            totalEpfEmployeeRm: payrollAudits.reduce(
              (s, a) => s + a.expected.epfEmployeeRm,
              0
            ),
            totalEpfEmployerRm: payrollAudits.reduce(
              (s, a) => s + a.expected.epfEmployerRm,
              0
            ),
            totalSocsoEmployeeRm: payrollAudits.reduce(
              (s, a) => s + a.expected.socsoEmployeeRm,
              0
            ),
            totalSocsoEmployerRm: payrollAudits.reduce(
              (s, a) => s + a.expected.socsoEmployerRm,
              0
            ),
            totalEisEmployeeRm: payrollAudits.reduce(
              (s, a) => s + a.expected.eisEmployeeRm,
              0
            ),
            totalEisEmployerRm: payrollAudits.reduce(
              (s, a) => s + a.expected.eisEmployerRm,
              0
            ),
            totalLindung24JamRm: payrollAudits.reduce(
              (s, a) => s + a.expected.lindung24JamEmployeeRm,
              0
            ),
            underpaymentVarianceRm: payrollAudits.reduce(
              (s, a) => s + a.totalShortfallOrVarianceRm,
              0
            ),
            employees: payrollAudits,
          },
          gigSummary: {
            caseTitle: `${gigCase.workerName} vs ${gigCase.platformOrClientName}`,
            totalClaimableRm: gigResult.totalClaimableRm,
            daysOverdue: gigResult.daysOverdue,
            suspensionDays: gigCase.suspensionDaysElapsed,
            expectedSksps125Rm: gigResult.expectedSksps125Rm,
            iSaraanMatchRm: gigResult.estimatedISaraanMatchRm,
            findingsCount: gigResult.findings.length,
          },
          stampDutySummary: {
            ...stampResult,
            partyName: entityName,
            monthlyAmountRm: stampDuty.monthlyWageOrRentRm,
          },
          draftedNotice: drafted
            ? {
                title: drafted.title,
                bodyEn: drafted.body,
                bodyBm: drafted.body,
              }
            : undefined,
        })}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-screen-xl px-6 py-12 text-body-sm text-txt-black-500">
          Loading Hakku Workspace...
        </div>
      }
    >
      <WorkspaceInner />
    </Suspense>
  );
}
