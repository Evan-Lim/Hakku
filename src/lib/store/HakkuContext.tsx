"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AppLocale,
  IlmuExecutionMode,
  MyDigitalIdProfile,
  PortalSyncPayload,
  UserPersona,
} from "@/lib/engines/types";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";
import { auditEmployeePayroll } from "@/lib/engines/payrollEngine";
import { auditGigCase } from "@/lib/engines/gigEngine";
import { calculateStampDuty2026 } from "@/lib/engines/stampDutyEngine";

interface HakkuContextValue {
  locale: AppLocale;
  setLocale: (loc: AppLocale) => void;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  ilmuMode: IlmuExecutionMode;
  setIlmuMode: (mode: IlmuExecutionMode) => void;
  digitalIdProfile: MyDigitalIdProfile;
  connectMyDigitalId: (profile: MyDigitalIdProfile) => void;
  disconnectMyDigitalId: () => void;
  myDigitalIdDialogOpen: boolean;
  setMyDigitalIdDialogOpen: (open: boolean) => void;
  portalPayload: PortalSyncPayload;
  setPortalPayload: (payload: PortalSyncPayload) => void;
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
}

const DEFAULT_PROFILE: MyDigitalIdProfile = {
  authenticated: false,
  nama: "Tetamu / Guest Sandbox",
  maskedNric: "96xxxx-xx-5214",
  tin: "IG 28491032010",
  ssmNo: "202403198421 (JM0984122-K)",
  companyName: "Hakku Sandbox Profile",
  citizenship: "citizen",
  verifiedAt: "",
  authMethod: "Guest Demo",
};

function buildInitialPayload(): PortalSyncPayload {
  const sme = DEMO_SCENARIOS.find((s) => s.id === "sme-razak") ?? DEMO_SCENARIOS[0];
  const audits = (sme.payrollEmployees ?? []).map(auditEmployeePayroll);
  const stamp = sme.stampDuty ? calculateStampDuty2026(sme.stampDuty) : undefined;
  const gigScenario = DEMO_SCENARIOS.find((s) => s.id === "gig-kumar");
  const gigAudit = gigScenario?.gigCase ? auditGigCase(gigScenario.gigCase) : undefined;

  return {
    sourcePersona: "sme",
    generatedAt: "2026-11-26T18:30:00+08:00",
    entityOrWorkerName: sme.entityName,
    employerName: sme.entityName,
    platformOrClientName: gigScenario?.counterpartyName,
    payrollSummary: {
      totalEmployees: audits.length,
      citizenCount: audits.filter((a) => a.citizenship === "citizen").length,
      foreignCount: audits.filter((a) => a.citizenship === "foreign").length,
      totalEpfEmployeeRm: audits.reduce((s, a) => s + a.expected.epfEmployeeRm, 0),
      totalEpfEmployerRm: audits.reduce((s, a) => s + a.expected.epfEmployerRm, 0),
      totalSocsoEmployeeRm: audits.reduce((s, a) => s + a.expected.socsoEmployeeRm, 0),
      totalSocsoEmployerRm: audits.reduce((s, a) => s + a.expected.socsoEmployerRm, 0),
      totalEisEmployeeRm: audits.reduce((s, a) => s + a.expected.eisEmployeeRm, 0),
      totalEisEmployerRm: audits.reduce((s, a) => s + a.expected.eisEmployerRm, 0),
      totalLindung24JamRm: audits.reduce((s, a) => s + a.expected.lindung24JamEmployeeRm, 0),
      underpaymentVarianceRm: audits.reduce((s, a) => s + a.totalShortfallOrVarianceRm, 0),
      employees: audits,
    },
    gigSummary: gigAudit
      ? {
          caseTitle: gigScenario?.titleEn ?? "Gig Case",
          totalClaimableRm: gigAudit.totalClaimableRm,
          daysOverdue: gigAudit.daysOverdue,
          suspensionDays: gigScenario?.gigCase?.suspensionDaysElapsed ?? 0,
          expectedSksps125Rm: gigAudit.expectedSksps125Rm,
          iSaraanMatchRm: gigAudit.estimatedISaraanMatchRm,
          findingsCount: gigAudit.findings.length,
        }
      : undefined,
    stampDutySummary: stamp
      ? {
          ...stamp,
          partyName: sme.entityName,
          monthlyAmountRm: sme.stampDuty?.monthlyWageOrRentRm ?? 4500,
        }
      : undefined,
  };
}

const HakkuContext = createContext<HakkuContextValue | null>(null);

export function HakkuProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>("en");
  const [persona, setPersona] = useState<UserPersona>("freelancer");
  const [ilmuMode, setIlmuMode] = useState<IlmuExecutionMode>("demo");
  const [digitalIdProfile, setDigitalIdProfile] =
    useState<MyDigitalIdProfile>(DEFAULT_PROFILE);
  const [myDigitalIdDialogOpen, setMyDigitalIdDialogOpen] = useState(false);
  const [portalPayload, setPortalPayload] = useState<PortalSyncPayload>(
    buildInitialPayload
  );
  const [activeScenarioId, setActiveScenarioId] = useState<string>("freelancer-hafiz");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("hakku-session-state-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.locale === "en" || parsed.locale === "bm") setLocale(parsed.locale);
        if (["freelancer", "sme", "worker"].includes(parsed.persona)) setPersona(parsed.persona);
        if (parsed.ilmuMode === "demo" || parsed.ilmuMode === "live") setIlmuMode(parsed.ilmuMode);
        if (parsed.digitalIdProfile?.authenticated !== undefined) {
          setDigitalIdProfile(parsed.digitalIdProfile);
        }
        if (parsed.portalPayload?.entityOrWorkerName) {
          setPortalPayload(parsed.portalPayload);
        }
        if (typeof parsed.activeScenarioId === "string") {
          setActiveScenarioId(parsed.activeScenarioId);
        }
      }
    } catch {
      // Ignore malformed sessionStorage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        "hakku-session-state-v1",
        JSON.stringify({
          locale,
          persona,
          ilmuMode,
          digitalIdProfile,
          portalPayload,
          activeScenarioId,
        })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [hydrated, locale, persona, ilmuMode, digitalIdProfile, portalPayload, activeScenarioId]);

  const connectMyDigitalId = (profile: MyDigitalIdProfile) => {
    setDigitalIdProfile(profile);
    setMyDigitalIdDialogOpen(false);
  };

  const disconnectMyDigitalId = () => {
    setDigitalIdProfile(DEFAULT_PROFILE);
  };

  return (
    <HakkuContext.Provider
      value={{
        locale,
        setLocale,
        persona,
        setPersona,
        ilmuMode,
        setIlmuMode,
        digitalIdProfile,
        connectMyDigitalId,
        disconnectMyDigitalId,
        myDigitalIdDialogOpen,
        setMyDigitalIdDialogOpen,
        portalPayload,
        setPortalPayload,
        activeScenarioId,
        setActiveScenarioId,
      }}
    >
      {children}
    </HakkuContext.Provider>
  );
}

export function useHakku() {
  const ctx = useContext(HakkuContext);
  if (!ctx) {
    throw new Error("useHakku must be used inside HakkuProvider");
  }
  return ctx;
}
