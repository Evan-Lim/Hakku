"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@govtechmy/myds-react/dialog";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { useHakku } from "@/lib/store/HakkuContext";
import { MyDigitalIdProfile, UserPersona } from "@/lib/engines/types";
import { CheckCircle2, QrCode, ShieldCheck } from "lucide-react";

const PRESET_IDENTITIES: Array<{
  id: string;
  persona: UserPersona;
  scenarioId: string;
  badgeEn: string;
  badgeBm: string;
  profile: MyDigitalIdProfile;
}> = [
  {
    id: "id-hafiz",
    persona: "freelancer",
    scenarioId: "freelancer-hafiz",
    badgeEn: "Freelance Business Owner",
    badgeBm: "Pemilik Perniagaan Bebas",
    profile: {
      authenticated: true,
      nama: "MUHAMMAD HAFIZ BIN ZULKIFLI",
      maskedNric: "94xxxx-xx-6019",
      tin: "IG 24891032040",
      ssmNo: "202303112940 (KT0548291-U)",
      companyName: "Hafiz Studio Creative",
      citizenship: "citizen",
      verifiedAt: new Date().toISOString(),
      authMethod: "MyDigital ID (Simulated SSO)",
    },
  },
  {
    id: "id-razak",
    persona: "sme",
    scenarioId: "sme-razak",
    badgeEn: "Full-Time SME Owner",
    badgeBm: "Pemilik Perniagaan PKS",
    profile: {
      authenticated: true,
      nama: "ABDUL RAZAK BIN MANSOR",
      maskedNric: "78xxxx-xx-5103",
      tin: "C 10948271000",
      ssmNo: "201901044122 (1353452-V)",
      companyName: "Kopi & Roti Warisan Sdn Bhd",
      citizenship: "citizen",
      verifiedAt: new Date().toISOString(),
      authMethod: "MyDigital ID (Simulated SSO)",
    },
  },
  {
    id: "id-aina",
    persona: "worker",
    scenarioId: "worker-aina",
    badgeEn: "Full-Time Worker",
    badgeBm: "Pekerja Sepenuh Masa",
    profile: {
      authenticated: true,
      nama: "AINA SOFIA BINTI AHMAD",
      maskedNric: "97xxxx-xx-5128",
      tin: "IG 29510482090",
      companyName: "Seri Mart Trading Sdn Bhd",
      citizenship: "citizen",
      verifiedAt: new Date().toISOString(),
      authMethod: "MyDigital ID (Simulated SSO)",
    },
  },
  {
    id: "id-kumar",
    persona: "freelancer",
    scenarioId: "gig-kumar",
    badgeEn: "Gig Platform Rider",
    badgeBm: "Penunggang Platform Gig",
    profile: {
      authenticated: true,
      nama: "KUMAR A/L SUBRAMANIAM",
      maskedNric: "95xxxx-xx-5841",
      tin: "IG 27739104020",
      companyName: "KilatGo Delivery Partner",
      citizenship: "citizen",
      verifiedAt: new Date().toISOString(),
      authMethod: "MyDigital ID (Simulated SSO)",
    },
  },
];

export function MyDigitalIdModal() {
  const {
    locale,
    myDigitalIdDialogOpen,
    setMyDigitalIdDialogOpen,
    connectMyDigitalId,
    setPersona,
    setActiveScenarioId,
    digitalIdProfile,
    disconnectMyDigitalId,
  } = useHakku();

  const [selectedId, setSelectedId] = useState<string>(PRESET_IDENTITIES[0].id);
  const [verifying, setVerifying] = useState(false);

  const selectedPreset =
    PRESET_IDENTITIES.find((p) => p.id === selectedId) ?? PRESET_IDENTITIES[0];

  const handleSimulatedApprove = () => {
    setVerifying(true);
    setTimeout(() => {
      connectMyDigitalId({
        ...selectedPreset.profile,
        verifiedAt: new Date().toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setPersona(selectedPreset.persona);
      setActiveScenarioId(selectedPreset.scenarioId);
      setVerifying(false);
    }, 550);
  };

  return (
    <Dialog
      open={myDigitalIdDialogOpen}
      onOpenChange={setMyDigitalIdDialogOpen}
    >
      <DialogBody className="max-w-lg">
        <DialogHeader border>
          <div className="flex items-center gap-3">
            <img
              src="/mydigitalid-mark.svg"
              alt="MyDigital ID Sandbox"
              className="h-9 w-9 rounded-md"
            />
            <div>
              <DialogTitle>
                {locale === "bm"
                  ? "Sambungan MyDigital ID (Simulasi Prototip)"
                  : "MyDigital ID Connect (Prototype OIDC Simulator)"}
              </DialogTitle>
              <DialogDescription>
                {locale === "bm"
                  ? "Pratonton aliran SSO OIDC rasmi tanpa menyimpan kata laluan."
                  : "Previews official OIDC / PKCE Single Sign-On claims for portal pre-fill."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogContent className="space-y-4 py-4">
          <Callout variant="warning">
            <CalloutTitle>
              {locale === "bm"
                ? "Mod Simulasi Keselamatan"
                : "Sandbox Identity Simulation"}
            </CalloutTitle>
            <CalloutContent>
              {locale === "bm"
                ? "Dalam produksi sebenar, pengguna mengesahkan melalui aplikasi rasmi MyDigital ID & MyGDX. Pilih satu profil demo di bawah untuk mempraisi portal."
                : "In production, users approve directly via the official MyDigital ID app & MyGDX rails. Choose a demo identity below to auto-populate official portal mirrors."}
            </CalloutContent>
          </Callout>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRESET_IDENTITIES.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`rounded-md border p-3 text-left transition ${
                    active
                      ? "border-primary-600 bg-bg-primary-50"
                      : "border-otl-gray-200 bg-bg-white hover:bg-bg-washed"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Tag size="small" variant={active ? "primary" : "default"}>
                      {locale === "bm" ? item.badgeBm : item.badgeEn}
                    </Tag>
                    {active && (
                      <CheckCircle2 className="h-4 w-4 text-txt-primary" />
                    )}
                  </div>
                  <p className="mt-2 font-heading text-body-sm font-semibold text-txt-black-900">
                    {item.profile.nama}
                  </p>
                  <p className="text-body-xs text-txt-black-500 tabular-nums">
                    NRIC: {item.profile.maskedNric} · TIN: {item.profile.tin}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-otl-gray-200 bg-bg-washed p-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-otl-gray-300 bg-bg-white">
              {verifying ? (
                <Spinner size="medium" />
              ) : (
                <QrCode className="h-8 w-8 text-txt-primary" />
              )}
            </div>
            <div className="space-y-1 text-body-xs text-txt-black-700">
              <p className="font-semibold text-txt-black-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-txt-success" />
                {locale === "bm"
                  ? "Atribut Disahkan OIDC (JPN / LHDN / SSM)"
                  : "Verified OIDC Claims Preview (JPN / LHDN / SSM)"}
              </p>
              <p className="tabular-nums">
                {selectedPreset.profile.companyName}
                {selectedPreset.profile.ssmNo
                  ? ` · SSM ${selectedPreset.profile.ssmNo}`
                  : ""}
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogFooter border align="end">
          {digitalIdProfile.authenticated && (
            <Button
              variant="danger-outline"
              size="small"
              onClick={() => {
                disconnectMyDigitalId();
                setMyDigitalIdDialogOpen(false);
              }}
            >
              {locale === "bm" ? "Putuskan Sesi" : "Disconnect"}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="default-outline" size="small">
              {locale === "bm" ? "Tutup" : "Cancel"}
            </Button>
          </DialogClose>
          <Button
            variant="primary-fill"
            size="small"
            disabled={verifying}
            onClick={handleSimulatedApprove}
          >
            {verifying
              ? locale === "bm"
                ? "Mengesahkan..."
                : "Approving Push..."
              : locale === "bm"
                ? "Sahkan & Masuk Portal"
                : "Approve & Connect Profile"}
          </Button>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  );
}
