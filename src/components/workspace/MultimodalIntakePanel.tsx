"use client";

import React, { useRef, useState } from "react";
import { Button } from "@govtechmy/myds-react/button";
import { Tag } from "@govtechmy/myds-react/tag";
import { Callout, CalloutContent, CalloutTitle } from "@govtechmy/myds-react/callout";
import { Checkbox } from "@govtechmy/myds-react/checkbox";
import { Label } from "@govtechmy/myds-react/label";
import { TextArea } from "@govtechmy/myds-react/textarea";
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
import { callIlmuAsr, callIlmuOcr } from "@/lib/ilmu/browserBridge";
import { FileUp, Mic, Shield, Sparkles, Square } from "lucide-react";

interface MultimodalIntakePanelProps {
  onApplyDemoVoice?: (transcript: string) => void;
  onOcrComplete?: (result: Record<string, unknown>) => void;
}

export function MultimodalIntakePanel({
  onApplyDemoVoice,
  onOcrComplete,
}: MultimodalIntakePanelProps) {
  const { locale, persona, ilmuMode, activeScenarioId } = useHakku();
  const [docType, setDocType] = useState<
    "payslip" | "gig_payout" | "employment_contract" | "workspace_lease"
  >(persona === "freelancer" ? "gig_payout" : "payslip");
  const [maskPii, setMaskPii] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    modelUsed: string;
    residency: string;
    documentLabel?: string;
    extractedFields?: Record<string, unknown>;
    rawText?: string;
    fallbackNotice?: string;
  } | null>(null);

  const [asrLoading, setAsrLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const [asrMeta, setAsrMeta] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const runOcr = async (fileName?: string, imageBase64?: string) => {
    setOcrLoading(true);
    try {
      const data = await callIlmuOcr({
        mode: ilmuMode,
        persona,
        documentType: docType,
        fileName,
        imageBase64,
        scenarioHint: activeScenarioId,
        maskPii,
      });
      setOcrResult(data);
      if (data.extractedFields && onOcrComplete) {
        onOcrComplete(data.extractedFields);
      }
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = typeof reader.result === "string" ? reader.result : undefined;
      void runOcr(file.name, b64);
    };
    reader.readAsDataURL(file);
  };

  const runAsr = async (audioBase64?: string) => {
    setAsrLoading(true);
    try {
      const data = await callIlmuAsr({
        mode: ilmuMode,
        persona,
        scenarioId: activeScenarioId,
        audioBase64,
        customSpokenHint: voiceNote || undefined,
      });
      setVoiceNote(data.transcript || "");
      setAsrMeta(data.modelUsed || "ilmu-asr-v4.2");
      if (onApplyDemoVoice && data.transcript) {
        onApplyDemoVoice(data.transcript);
      }
    } finally {
      setAsrLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      void runAsr();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = typeof reader.result === "string" ? reader.result : undefined;
          void runAsr(b64);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      // If browser microphone permission is unavailable, cleanly fall back to sample Manglish ASR
      void runAsr();
    }
  };

  return (
    <div className="rounded-lg border border-otl-gray-200 bg-bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-otl-gray-200 pb-3">
        <div>
          <h2 className="font-heading text-heading-2xs font-semibold text-txt-black-900">
            {t(locale, "intakeTitle")}
          </h2>
          <p className="mt-1 text-body-xs text-txt-black-500">
            {t(locale, "intakeSubtitle")}
          </p>
        </div>
        <Tag variant="success" size="small" dot>
          <Shield className="mr-1 h-3 w-3" />
          {locale === "bm" ? "Diproses di Malaysia" : "Malaysia Onshore AI"}
        </Tag>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Document Vision OCR */}
        <div className="space-y-3 rounded-md border border-otl-gray-200 bg-bg-washed p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading text-body-sm font-semibold text-txt-black-900">
              {locale === "bm"
                ? "1. Imbas Dokumen (ilmu-vision-v1.3)"
                : "1. Document & Screenshot Scan (ilmu-vision-v1.3)"}
            </span>
            <Tag size="small" variant="primary">
              OCR
            </Tag>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label size="small" className="mb-1 block">
                {locale === "bm" ? "Jenis Dokumen" : "Document Type"}
              </Label>
              <Select
                variant="outline"
                size="medium"
                value={docType}
                onValueChange={(v) =>
                  setDocType(
                    v as
                      | "payslip"
                      | "gig_payout"
                      | "employment_contract"
                      | "workspace_lease"
                  )
                }
              >
                <SelectTrigger className="w-full bg-bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payslip">
                    <span>
                      {locale === "bm" ? "Slip Gaji / Payroll" : "Monthly Payslip / Payroll"}
                    </span>
                  </SelectItem>
                  <SelectItem value="gig_payout">
                    <span>
                      {locale === "bm"
                        ? "Tangkap Layar Gig / Invois"
                        : "Gig Payout / Suspension / SOW"}
                    </span>
                  </SelectItem>
                  <SelectItem value="employment_contract">
                    <span>
                      {locale === "bm"
                        ? "Kontrak Kerja (Butiran 4)"
                        : "Employment Contract (Item 4)"}
                    </span>
                  </SelectItem>
                  <SelectItem value="workspace_lease">
                    <span>
                      {locale === "bm"
                        ? "Perjanjian Sewa Premis (49a)"
                        : "Workspace / Shop Lease (49a)"}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-body-xs text-txt-black-700">
                <Checkbox
                  checked={maskPii}
                  onCheckedChange={(val) => setMaskPii(Boolean(val))}
                />
                <span>
                  {locale === "bm"
                    ? "Lindungi No. KP & Akaun Bank"
                    : "Mask NRIC & Bank No. in preview"}
                </span>
              </label>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary-outline"
              size="small"
              disabled={ocrLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              {locale === "bm" ? "Muat Naik Fail / Gambar" : "Upload Payslip / Image"}
            </Button>
            <Button
              variant="default-outline"
              size="small"
              className="bg-bg-white"
              disabled={ocrLoading}
              onClick={() => void runOcr("sample-malaysian-doc.jpg")}
            >
              {ocrLoading ? (
                <Spinner size="small" className="mr-1.5" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-txt-primary" />
              )}
              {locale === "bm" ? "Simulasi Imbasan" : "Run Sample Scan"}
            </Button>
          </div>

          {ocrResult && (
            <div className="rounded border border-otl-gray-200 bg-bg-white p-3 text-body-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
                <span className="font-semibold text-txt-black-900">
                  {ocrResult.documentLabel ?? "Extracted Record"}
                </span>
                <Tag size="small" variant="success">
                  {ocrResult.modelUsed}
                </Tag>
              </div>
              {ocrResult.extractedFields ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-txt-black-700">
                  {Object.entries(ocrResult.extractedFields).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <dt className="inline font-medium text-txt-black-500">{k}: </dt>
                      <dd className="inline font-medium text-txt-black-900 tabular-nums">
                        {String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <pre className="whitespace-pre-wrap text-body-xs text-txt-black-700">
                  {ocrResult.rawText}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Voice / Manglish ASR */}
        <div className="space-y-3 rounded-md border border-otl-gray-200 bg-bg-washed p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading text-body-sm font-semibold text-txt-black-900">
              {locale === "bm"
                ? "2. Suara BM / Inggeris / Manglish (ilmu-asr-v4.2)"
                : "2. Voice Note in BM / EN / Manglish (ilmu-asr-v4.2)"}
            </span>
            <Tag size="small" variant="primary">
              ASR
            </Tag>
          </div>

          <TextArea
            size="small"
            rows={3}
            value={voiceNote}
            onChange={(e) => setVoiceNote(e.target.value)}
            placeholder={
              locale === "bm"
                ? "Contoh: Client dah 15 hari belum bayar invois RM2,800, atau bos potong Lindung 24 Jam..."
                : "Example: Client unpaid for 15 days under Act 872, or payroll deducted Lindung 24 Jam after opt-out..."
            }
            className="bg-bg-white"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isRecording ? "danger-fill" : "primary-outline"}
              size="small"
              disabled={asrLoading}
              onClick={() => void toggleRecording()}
            >
              {isRecording ? (
                <>
                  <Square className="mr-1.5 h-3.5 w-3.5" />
                  {locale === "bm" ? "Henti Rakaman" : "Stop Mic"}
                </>
              ) : (
                <>
                  <Mic className="mr-1.5 h-3.5 w-3.5" />
                  {locale === "bm" ? "Rakam Suara" : "Record Voice"}
                </>
              )}
            </Button>

            <Button
              variant="default-outline"
              size="small"
              className="bg-bg-white"
              disabled={asrLoading}
              onClick={() => void runAsr()}
            >
              {asrLoading ? (
                <Spinner size="small" className="mr-1.5" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-txt-primary" />
              )}
              {locale === "bm" ? "Transkrip Suara Demo" : "Transcribe Demo Audio"}
            </Button>

            {asrMeta && (
              <Tag size="small" variant="default">
                {asrMeta}
              </Tag>
            )}
          </div>
        </div>
      </div>

      {ocrResult?.fallbackNotice && (
        <Callout variant="info" className="mt-3">
          <CalloutTitle>Sovereign Demo Fallback Active</CalloutTitle>
          <CalloutContent>{ocrResult.fallbackNotice}</CalloutContent>
        </Callout>
      )}
    </div>
  );
}
