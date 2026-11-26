"use client";

import React from "react";
import { Input } from "@govtechmy/myds-react/input";
import { Label } from "@govtechmy/myds-react/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@govtechmy/myds-react/select";
import { Checkbox } from "@govtechmy/myds-react/checkbox";
import { Tag } from "@govtechmy/myds-react/tag";
import {
  SummaryList,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "@govtechmy/myds-react/summary-list";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { StampDutyInput, StampDutyResult } from "@/lib/engines/types";
import { useHakku } from "@/lib/store/HakkuContext";

interface StampDutyPanelProps {
  value: StampDutyInput;
  onChange: (next: StampDutyInput) => void;
  result: StampDutyResult;
}

export function StampDutyPanel({ value, onChange, result }: StampDutyPanelProps) {
  const { locale } = useHakku();

  return (
    <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-otl-gray-200 pb-3">
        <div>
          <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
            {locale === "bm"
              ? "Semakan Kontrak, Premis Kerja & e-Duti Setem (2026)"
              : "Contracts, Workspace Leases & 2026 e-Duti Setem Check"}
          </h3>
          <p className="text-body-xs text-txt-black-500">
            {locale === "bm"
              ? "Butiran 4 (Kontrak Kerja — pengecualian <= RM3,000) & Butiran 49(a) (Sewa Premis tanpa pengecualian RM2,400 + PKPS sebelum 31 Dis 2026)."
              : "Item 4 (Employment Contracts — <= RM3,000 exempt) & Item 49(a) (Workspace Leases without RM2,400 exemption + PKPS amnesty until Dec 31, 2026)."}
          </p>
        </div>
        <Tag variant={result.isExempt ? "success" : "primary"} size="small">
          {result.isExempt
            ? locale === "bm"
              ? "Dikecualikan (RM0)"
              : "Exempt (RM0)"
            : `RM${result.totalStampDutyRm.toFixed(2)}`}
        </Tag>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Label size="small" className="mb-1 block">
            {locale === "bm" ? "Jenis Dokumen" : "Instrument Type"}
          </Label>
          <Select
            variant="outline"
            size="medium"
            value={value.instrumentType}
            onValueChange={(v) =>
              onChange({
                ...value,
                instrumentType: v as StampDutyInput["instrumentType"],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employment_contract">
                <span>
                  {locale === "bm"
                    ? "Kontrak Pekerjaan (Butiran 4)"
                    : "Employment Contract (Item 4)"}
                </span>
              </SelectItem>
              <SelectItem value="tenancy_workspace">
                <span>
                  {locale === "bm"
                    ? "Sewa Kedai / Studio / Asrama (Butiran 49a)"
                    : "Shop-lot / Studio / Staff Quarters Lease (Item 49a)"}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label size="small" className="mb-1 block">
            {value.instrumentType === "employment_contract"
              ? locale === "bm"
                ? "Gaji Bulanan (RM)"
                : "Monthly Salary (RM)"
              : locale === "bm"
                ? "Sewa Bulanan (RM)"
                : "Monthly Rent (RM)"}
          </Label>
          <Input
            size="medium"
            type="number"
            min={0}
            value={value.monthlyWageOrRentRm}
            onChange={(e) =>
              onChange({
                ...value,
                monthlyWageOrRentRm: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>

        {value.instrumentType === "tenancy_workspace" ? (
          <div>
            <Label size="small" className="mb-1 block">
              {locale === "bm" ? "Tempoh (Tahun)" : "Lease Term (Years)"}
            </Label>
            <Input
              size="medium"
              type="number"
              min={1}
              max={10}
              value={value.tenancyYears}
              onChange={(e) =>
                onChange({
                  ...value,
                  tenancyYears: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
        ) : (
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-body-xs text-txt-black-700">
              <Checkbox
                checked={Boolean(value.isSubsidiarySupplementaryDoc)}
                onCheckedChange={(c) =>
                  onChange({
                    ...value,
                    isSubsidiarySupplementaryDoc: Boolean(c),
                  })
                }
              />
              <span>
                {locale === "bm"
                  ? "Surat Tambahan Sahaja"
                  : "Supplementary Doc Only"}
              </span>
            </label>
          </div>
        )}

        <div>
          <Label size="small" className="mb-1 block">
            {locale === "bm" ? "Hari Sejak Tandatangan" : "Days Since Signed"}
          </Label>
          <Input
            size="medium"
            type="number"
            min={0}
            value={value.signedDaysAgo}
            onChange={(e) =>
              onChange({
                ...value,
                signedDaysAgo: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SummaryList>
          <SummaryListHeader>
            <span className="font-heading text-body-sm font-semibold">
              {locale === "bm"
                ? "Ringkasan Taksiran MyTax e-Duti Setem"
                : "MyTax e-Duti Setem Assessment Summary"}
            </span>
          </SummaryListHeader>
          <SummaryListBody>
            <SummaryListRow>
              <SummaryListTerm>
                {locale === "bm" ? "Duti Asal (Induk)" : "Principal Duty"}
              </SummaryListTerm>
              <SummaryListDetail className="tabular-nums font-medium">
                RM{result.principalDutyRm.toFixed(2)}
              </SummaryListDetail>
            </SummaryListRow>
            <SummaryListRow>
              <SummaryListTerm>
                {locale === "bm" ? "Salinan Pendua" : "Duplicate Copy Duty"}
              </SummaryListTerm>
              <SummaryListDetail className="tabular-nums font-medium">
                RM{result.duplicateDutyRm.toFixed(2)}
              </SummaryListDetail>
            </SummaryListRow>
            <SummaryListRow>
              <SummaryListTerm>
                {locale === "bm" ? "Jumlah Perlu Dibayar" : "Total Stamp Duty"}
              </SummaryListTerm>
              <SummaryListDetail className="tabular-nums font-semibold text-txt-primary">
                RM{result.totalStampDutyRm.toFixed(2)}
              </SummaryListDetail>
            </SummaryListRow>
            <SummaryListRow>
              <SummaryListTerm>
                {locale === "bm" ? "Status Tempoh 30 Hari" : "30-Day Stamping Window"}
              </SummaryListTerm>
              <SummaryListDetail>
                {result.isPast30DayWindow
                  ? locale === "bm"
                    ? "Melebihi 30 hari — Layak Pengampunan PKPS"
                    : "Past 30 days — PKPS Voluntary Disclosure Eligible"
                  : locale === "bm"
                    ? `Baki ${result.daysRemainingIn30DayWindow} hari`
                    : `${result.daysRemainingIn30DayWindow} days remaining`}
              </SummaryListDetail>
            </SummaryListRow>
          </SummaryListBody>
        </SummaryList>

        <div className="space-y-3">
          {result.findings.map((f) => (
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
                  {f.citation.act} ({f.citation.section})
                </span>
              </CalloutContent>
            </Callout>
          ))}
        </div>
      </div>
    </div>
  );
}
