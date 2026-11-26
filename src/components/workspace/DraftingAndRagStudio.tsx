"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { TextArea } from "@govtechmy/myds-react/textarea";
import { Input } from "@govtechmy/myds-react/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@govtechmy/myds-react/select";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { useHakku } from "@/lib/store/HakkuContext";
import { t } from "@/lib/i18n/dictionary";
import { PortalSyncPayload } from "@/lib/engines/types";
import { callIlmuDraft, callIlmuRag, callIlmuTts } from "@/lib/ilmu/browserBridge";
import { Copy, Landmark, MessageSquareText, Sparkles, Volume2 } from "lucide-react";

type DraftKind =
  | "hr_clarification"
  | "wfw_summary"
  | "client_reminder"
  | "gig_tribunal_dossier"
  | "sme_staff_advisory"
  | "pkps_stamp_cover";

interface DraftingAndRagStudioProps {
  partyName: string;
  counterpartyName: string;
  findingsSummary: string[];
  totalAmountRm: number;
  buildSyncPayload: (drafted?: { title: string; body: string }) => PortalSyncPayload;
}

export function DraftingAndRagStudio({
  partyName,
  counterpartyName,
  findingsSummary,
  totalAmountRm,
  buildSyncPayload,
}: DraftingAndRagStudioProps) {
  const router = useRouter();
  const { locale, persona, ilmuMode, setPortalPayload } = useHakku();

  const defaultKind: DraftKind =
    persona === "sme"
      ? "sme_staff_advisory"
      : persona === "freelancer"
        ? "client_reminder"
        : "hr_clarification";

  const [draftKind, setDraftKind] = useState<DraftKind>(defaultKind);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftModel, setDraftModel] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [ttsLoading, setTtsLoading] = useState(false);
  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragLoading, setRagLoading] = useState(false);

  const generateDraft = async () => {
    setDraftLoading(true);
    try {
      const data = await callIlmuDraft({
        mode: ilmuMode,
        locale,
        persona,
        draftKind,
        partyName,
        counterpartyName,
        findingsSummary,
        totalAmountRm,
      });
      setDraftTitle(data.title || "");
      setDraftBody(data.body || "");
      setDraftModel(data.modelUsed || "ilmu-v3.1");
    } finally {
      setDraftLoading(false);
    }
  };

  const speakSummary = async () => {
    const textToSpeak =
      draftBody ||
      findingsSummary.slice(0, 3).join(". ") ||
      "Hakku compliance check complete.";
    setTtsLoading(true);
    try {
      const data = await callIlmuTts({
        mode: ilmuMode,
        locale,
        text: textToSpeak.slice(0, 800),
      });
      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        await audio.play();
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(data.fallbackSpeechText || textToSpeak);
        utter.lang = locale === "bm" ? "ms-MY" : "en-MY";
        window.speechSynthesis.speak(utter);
      }
    } finally {
      setTtsLoading(false);
    }
  };

  const askStatutoryRag = async () => {
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try {
      const data = await callIlmuRag({
        mode: ilmuMode,
        locale,
        persona,
        query: ragQuery,
      });
      setRagAnswer(data.answer || "");
    } finally {
      setRagLoading(false);
    }
  };

  const handleSyncToPortals = () => {
    const payload = buildSyncPayload(
      draftBody ? { title: draftTitle, body: draftBody } : undefined
    );
    setPortalPayload(payload);
    const targetRoute =
      persona === "freelancer"
        ? "/portals/kesuma"
        : persona === "sme"
          ? "/portals/perkeso"
          : "/portals/kwsp";
    router.push(targetRoute);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left: Drafting Studio + TTS + Portal Sync */}
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-otl-gray-200 pb-3">
          <div>
            <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
              {t(locale, "draftingTitle")}
            </h3>
            <p className="text-body-xs text-txt-black-500">
              {t(locale, "draftingSubtitle")}
            </p>
          </div>
          {draftModel && (
            <Tag size="small" variant="primary">
              {draftModel}
            </Tag>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[240px] flex-1">
            <Select
              variant="outline"
              size="medium"
              value={draftKind}
              onValueChange={(v) => setDraftKind(v as DraftKind)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr_clarification">
                  <span>
                    {locale === "bm"
                      ? "Nota Penjelasan Berhemah kepada HR"
                      : "Constructive HR Clarification Note"}
                  </span>
                </SelectItem>
                <SelectItem value="wfw_summary">
                  <span>
                    {locale === "bm"
                      ? "Ringkasan Rasmi JTKSM / WFW"
                      : "JTKSM / Working for Workers (WFW) Summary"}
                  </span>
                </SelectItem>
                <SelectItem value="client_reminder">
                  <span>
                    {locale === "bm"
                      ? "Peringatan Invois Sopan (Akta 872)"
                      : "Polite Client / Platform Payout Reminder (Act 872)"}
                  </span>
                </SelectItem>
                <SelectItem value="gig_tribunal_dossier">
                  <span>
                    {locale === "bm"
                      ? "Draf Tribunal Pekerja Gig (Akta 872)"
                      : "Gig Workers Tribunal Pre-Filing Dossier"}
                  </span>
                </SelectItem>
                <SelectItem value="sme_staff_advisory">
                  <span>
                    {locale === "bm"
                      ? "Memo Penyelarasan Staf PKS"
                      : "SME Pre-Payday Staff Advisory Memo"}
                  </span>
                </SelectItem>
                <SelectItem value="pkps_stamp_cover">
                  <span>
                    {locale === "bm"
                      ? "Ringkasan e-Duti Setem / PKPS MyTax"
                      : "MyTax e-Duti Setem / PKPS Filing Cover"}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="primary-fill"
            size="medium"
            disabled={draftLoading}
            onClick={() => void generateDraft()}
          >
            {draftLoading ? (
              <Spinner size="small" className="mr-1.5" />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" />
            )}
            {locale === "bm" ? "Jana Draf Dwibahasa" : "Generate Smooth Draft"}
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {draftTitle && (
            <p className="font-heading text-body-sm font-semibold text-txt-black-900">
              {draftTitle}
            </p>
          )}
          <TextArea
            size="medium"
            rows={7}
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder={
              locale === "bm"
                ? "Klik 'Jana Draf Dwibahasa' untuk menghasilkan surat berhemah berasaskan kiraan tepat di atas."
                : "Click 'Generate Smooth Draft' to compose a calm, statutory-backed letter using exact verified Ringgit amounts."
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default-outline"
              size="small"
              disabled={!draftBody}
              onClick={() => {
                void navigator.clipboard.writeText(draftBody);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied
                ? locale === "bm"
                  ? "Disalin"
                  : "Copied"
                : locale === "bm"
                  ? "Salin Teks"
                  : "Copy Text"}
            </Button>

            <Button
              variant="default-outline"
              size="small"
              disabled={ttsLoading}
              onClick={() => void speakSummary()}
            >
              <Volume2 className="mr-1.5 h-3.5 w-3.5 text-txt-primary" />
              {locale === "bm"
                ? "Dengar Ringkasan (TTS)"
                : "Listen Summary (ilmu-tts-v2)"}
            </Button>
          </div>

          <Button
            variant="primary-fill"
            size="medium"
            onClick={handleSyncToPortals}
          >
            <Landmark className="mr-1.5 h-4 w-4" />
            {t(locale, "syncToPortalsCta")}
          </Button>
        </div>
      </div>

      {/* Right: Statutory RAG Q&A (bge-m3 + ilmu-v3.1) */}
      <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card lg:col-span-5">
        <div className="flex items-center justify-between border-b border-otl-gray-200 pb-3">
          <div>
            <h3 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
              {locale === "bm"
                ? "Tanya Undang-Undang Kerja 2026"
                : "2026 Malaysian Law RAG Copilot"}
            </h3>
            <p className="text-body-xs text-txt-black-500">
              <code>bge-m3</code> + <code>ilmu-v3.1</code> · Cited statutory answers
            </p>
          </div>
          <MessageSquareText className="h-5 w-5 text-txt-primary" />
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              locale === "bm"
                ? "Bolehkah elaun campur gaji pokok RM1,700?"
                : "Can allowances count toward RM1,700 basic wage?",
              locale === "bm"
                ? "Hak penggantungan 14 hari Akta 872"
                : "Act 872 14-day suspension & 50% back-pay?",
              locale === "bm"
                ? "Kadar KWSP 2% pekerja asing & PKPS 2026"
                : "2% foreign worker EPF & 2026 PKPS stamp amnesty?",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setRagQuery(q)}
                className="rounded-full border border-otl-gray-200 bg-bg-washed px-2.5 py-1 text-left text-body-xs text-txt-black-700 hover:bg-bg-primary-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              size="medium"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder={
                locale === "bm"
                  ? "Tanya dalam BM, Inggeris atau Manglish..."
                  : "Ask in EN, BM, or Manglish..."
              }
            />
            <Button
              variant="primary-outline"
              size="medium"
              disabled={ragLoading}
              onClick={() => void askStatutoryRag()}
            >
              {ragLoading ? <Spinner size="small" /> : locale === "bm" ? "Tanya" : "Ask"}
            </Button>
          </div>

          {ragAnswer && (
            <div className="rounded-md border border-otl-primary-200 bg-bg-primary-50 p-3.5 text-body-sm text-txt-black-900">
              {ragAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
