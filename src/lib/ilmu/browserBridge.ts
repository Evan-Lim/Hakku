"use client";

import { AppLocale, IlmuExecutionMode, UserPersona } from "@/lib/engines/types";
import {
  buildSmoothDemoDraft,
  DocumentScanType,
  DraftKind,
  runDemoAsr,
  runDemoOcr,
  runDemoRag,
  runDemoTts,
} from "@/lib/ilmu/demoEngine";

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

async function postApiOrNull<T>(url: string, body: unknown): Promise<T | null> {
  if (IS_STATIC_EXPORT) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function callIlmuStatus(): Promise<{
  credentialsConfigured: boolean;
  staticExport: boolean;
}> {
  if (IS_STATIC_EXPORT) {
    return { credentialsConfigured: false, staticExport: true };
  }
  try {
    const res = await fetch("/api/ilmu/status");
    if (!res.ok) return { credentialsConfigured: false, staticExport: false };
    const data = await res.json();
    return {
      credentialsConfigured: Boolean(data?.credentialsConfigured),
      staticExport: false,
    };
  } catch {
    return { credentialsConfigured: false, staticExport: false };
  }
}

export async function callIlmuOcr(params: {
  mode: IlmuExecutionMode;
  persona: UserPersona;
  documentType: DocumentScanType;
  fileName?: string;
  imageBase64?: string;
  scenarioHint?: string;
  maskPii: boolean;
}) {
  const apiRes = await postApiOrNull<ReturnType<typeof runDemoOcr> & { rawText?: string }>(
    "/api/ilmu/ocr",
    params
  );
  if (apiRes) return apiRes;

  return runDemoOcr({
    ...params,
    fallbackNotice:
      params.mode === "live"
        ? "Static site build active — running Sovereign Browser Sandbox mode."
        : undefined,
  });
}

export async function callIlmuAsr(params: {
  mode: IlmuExecutionMode;
  persona: UserPersona;
  scenarioId?: string;
  audioBase64?: string;
  customSpokenHint?: string;
}) {
  const apiRes = await postApiOrNull<ReturnType<typeof runDemoAsr>>(
    "/api/ilmu/asr",
    params
  );
  if (apiRes) return apiRes;

  return runDemoAsr({
    ...params,
    fallbackNotice:
      params.mode === "live"
        ? "Static site build active — running Sovereign Browser Sandbox mode."
        : undefined,
  });
}

export async function callIlmuRag(params: {
  mode: IlmuExecutionMode;
  locale: AppLocale;
  persona: UserPersona;
  query: string;
}) {
  const apiRes = await postApiOrNull<ReturnType<typeof runDemoRag>>(
    "/api/ilmu/rag",
    params
  );
  if (apiRes) return apiRes;

  return runDemoRag({
    ...params,
    fallbackNotice:
      params.mode === "live"
        ? "Static site build active — running Sovereign Browser Sandbox mode."
        : undefined,
  });
}

export async function callIlmuDraft(params: {
  mode: IlmuExecutionMode;
  locale: AppLocale;
  persona: UserPersona;
  draftKind: DraftKind;
  partyName: string;
  counterpartyName: string;
  findingsSummary: string[];
  totalAmountRm: number;
}) {
  const apiRes = await postApiOrNull<{
    executionMode: string;
    modelUsed: string;
    title: string;
    body: string;
  }>("/api/ilmu/draft", params);
  if (apiRes) return apiRes;

  const draft = buildSmoothDemoDraft(params);
  return {
    executionMode: "demo",
    modelUsed: "ilmu-v3.1 (Sovereign Sandbox)",
    ...draft,
  };
}

export async function callIlmuTts(params: {
  mode: IlmuExecutionMode;
  locale: AppLocale;
  text: string;
}) {
  const apiRes = await postApiOrNull<ReturnType<typeof runDemoTts>>(
    "/api/ilmu/tts",
    params
  );
  if (apiRes) return apiRes;

  return runDemoTts(params);
}
