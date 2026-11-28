"use client";

// /lapor — the JTKSM report page. The agent pre-fills everything it can; the user adds their own
// name, IC and phone, ticks the declaration and submits. Submitting goes to the Hakku mirror only
// (POST /api/agent/submit); the official portal is opened by the user, who pastes with Copy buttons.

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@govtechmy/myds-react/button";
import { useHakku } from "@/lib/store/HakkuContext";
import { callHakkuAgentSubmit } from "@/lib/agent/agentBridge";
import { loadReportPack, missingUserFields, type JtksmReportPack } from "@/lib/agent/handoff";
import type { PortalField } from "@/lib/agent/types";

const TEXT = {
  en: {
    title: "Complaint to the Labour Department (JTKSM)",
    sub: "Everything below is filled in from your check. Fix anything that is wrong, then submit.",
    demo: "This is a Hakku page. The official complaint is made on the portal below, where you log in with your own account.",
    empty: "There is no report to show yet. Start a check first, and Hakku will prepare the report for you.",
    start: "Start a check",
    you: "you fill this in",
    hakku: "filled by Hakku",
    copy: "Copy",
    copied: "Copied",
    consent: "I have checked this report and the details are true.",
    missing: "Please fill in your name, IC number and phone number first.",
    submit: "Submit report",
    sending: "Submitting…",
    official: "Open the official portal",
    officialNote: "On the official portal, log in and paste each part with the Copy buttons.",
    done: "Report submitted",
    doneNote: "Demo reference number, not an official JTKSM number.",
    failed: "We could not submit the report. Please try again.",
    attachments: "Documents to attach",
  },
  bm: {
    title: "Aduan kepada Jabatan Tenaga Kerja (JTKSM)",
    sub: "Semua di bawah diisi daripada semakan anda. Betulkan jika ada yang salah, kemudian hantar.",
    demo: "Ini halaman Hakku. Aduan rasmi dibuat di portal di bawah, di mana anda log masuk dengan akaun anda sendiri.",
    empty: "Belum ada laporan untuk dipaparkan. Mulakan semakan dahulu dan Hakku akan menyediakan laporan untuk anda.",
    start: "Mula semakan",
    you: "anda isi",
    hakku: "diisi oleh Hakku",
    copy: "Salin",
    copied: "Disalin",
    consent: "Saya telah menyemak laporan ini dan maklumat adalah benar.",
    missing: "Sila isi nama, No. KP dan nombor telefon anda dahulu.",
    submit: "Hantar laporan",
    sending: "Menghantar…",
    official: "Buka portal rasmi",
    officialNote: "Di portal rasmi, log masuk dan tampal setiap bahagian dengan butang Salin.",
    done: "Laporan dihantar",
    doneNote: "Nombor rujukan demo, bukan nombor rasmi JTKSM.",
    failed: "Laporan tidak dapat dihantar. Sila cuba lagi.",
    attachments: "Dokumen untuk dilampirkan",
  },
} as const;

export default function LaporPage() {
  const { locale } = useHakku();
  const tx = TEXT[locale === "bm" ? "bm" : "en"];
  const [pack, setPack] = useState<JtksmReportPack | null>(null);
  const [fields, setFields] = useState<PortalField[]>([]);
  const [consent, setConsent] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadReportPack();
    setPack(loaded);
    setFields(loaded ? loaded.fields.filter((f) => f.key !== "declaration") : []);
  }, []);

  const missing = useMemo(() => missingUserFields(fields).length > 0, [fields]);
  const canSubmit = consent && !missing && status !== "sending";

  const update = (key: string, value: string) =>
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard blocked: the text is still selectable in the field */
    }
    setCopiedKey(key);
  };

  const submit = async () => {
    if (!pack || !canSubmit) return;
    setStatus("sending");
    try {
      const res = await callHakkuAgentSubmit({
        portalId: pack.portalId,
        target: "mirror",
        consentConfirmed: true,
        fields: [...fields, { key: "declaration", labelMs: "Pengakuan maklumat adalah benar", value: "Ya", filledBy: "user" }],
      });
      setReference(res.referenceNo);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  if (!pack) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-heading-xs font-semibold">{tx.title}</h1>
        <p className="mt-3 text-body-md text-txt-black-700">{tx.empty}</p>
        <Link href="/" className="mt-6 inline-block font-semibold text-txt-primary underline">
          {tx.start}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      <header className="space-y-2">
        <p className="text-body-sm font-semibold text-txt-primary">{pack.agencyMs}</p>
        <h1 className="text-heading-xs font-semibold">{tx.title}</h1>
        <p className="text-body-md text-txt-black-700">{tx.sub}</p>
        <p className="rounded-lg bg-bg-washed px-3 py-2 text-body-sm text-txt-black-700">{tx.demo}</p>
      </header>

      {reference && (
        <section role="status" className="rounded-xl border border-otl-success-200 bg-bg-success-50 p-5 text-center">
          <p className="text-body-lg font-semibold">{tx.done}</p>
          <p className="mt-2 font-mono text-body-lg font-semibold">{reference}</p>
          <p className="mt-2 text-body-sm text-txt-black-700">{tx.doneNote}</p>
        </section>
      )}

      <section className="divide-y divide-otl-gray-200 rounded-xl border border-otl-gray-200 bg-bg-white px-4">
        <div className="py-3">
          <p className="text-body-sm font-semibold">Perkara</p>
          <p className="mt-1 text-body-md">{pack.perkara}</p>
        </div>
        {fields.map((f) => {
          const long = f.key === "description";
          return (
            <div key={f.key} className="space-y-2 py-3">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`f-${f.key}`} className="text-body-sm font-semibold">
                  {f.labelMs}
                </label>
                <span className="flex items-center gap-2">
                  <span
                    className={
                      f.filledBy === "user"
                        ? "rounded-full bg-bg-warning-50 px-2 py-0.5 text-body-2xs font-semibold text-txt-warning"
                        : "rounded-full bg-bg-primary-50 px-2 py-0.5 text-body-2xs font-semibold text-txt-primary"
                    }
                  >
                    {f.filledBy === "user" ? tx.you : tx.hakku}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(f.key, f.value)}
                    className="rounded-md border border-otl-gray-200 px-2 py-1 text-body-xs font-semibold"
                  >
                    {copiedKey === f.key ? tx.copied : tx.copy}
                  </button>
                </span>
              </div>
              {long ? (
                <textarea
                  id={`f-${f.key}`}
                  rows={10}
                  value={f.value}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-lg border border-otl-gray-200 p-3 text-body-sm leading-relaxed"
                />
              ) : (
                <input
                  id={`f-${f.key}`}
                  value={f.value}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="h-11 w-full rounded-lg border border-otl-gray-200 px-3 text-body-md"
                />
              )}
            </div>
          );
        })}
        {pack.attachments.length > 0 && (
          <div className="py-3">
            <p className="text-body-sm font-semibold">{tx.attachments}</p>
            <ol className="mt-1 list-decimal pl-5 text-body-sm">
              {pack.attachments.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {!reference && (
        <section className="space-y-3">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 text-body-md">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5" />
            {tx.consent}
          </label>
          {missing && <p className="text-body-sm text-txt-warning">{tx.missing}</p>}
          {status === "error" && <p className="text-body-sm text-txt-danger">{tx.failed}</p>}
          <Button variant="primary-fill" size="large" className="w-full justify-center" disabled={!canSubmit} onClick={submit}>
            {status === "sending" ? tx.sending : tx.submit}
          </Button>
        </section>
      )}

      <a
        href={pack.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center rounded-lg border border-otl-gray-200 font-semibold text-txt-primary"
      >
        {tx.official}
      </a>
      <p className="text-center text-body-sm text-txt-black-700">{tx.officialNote}</p>
    </main>
  );
}
