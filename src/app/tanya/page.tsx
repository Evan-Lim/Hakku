"use client";

// /tanya — Tanya Hakku: one prompt in any language → Hakku works out the case, calculates with the
// engines, writes a formal BM report and prepares WhatsApp / Gmail / JTKSM. The user always sends.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Landmark, Loader2, Mail, MessageCircle, Mic, Square, Volume2 } from "lucide-react";
import { useHakku } from "@/lib/store/HakkuContext";
import { callHakkuAgent } from "@/lib/agent/agentBridge";
import { buildGmailComposeUrl, buildJtksmReportPack, buildMailtoUrl, isValidEmail, saveReportPack } from "@/lib/agent/handoff";
import type { AgentFactKey, AgentRequest, AgentResponse, AgentStepId } from "@/lib/agent/types";
import { createRecognizer, speak, stopSpeaking, type SpeakResult } from "@/components/agent/speech";

type Lc = "en" | "bm";

const TX = {
  en: {
    title: "Tell Hakku what happened",
    sub: "Write it the way you would tell a friend, in BM, English, 中文 or தமிழ். Hakku works out the rest.",
    placeholder: "e.g. Boss tak bayar OT saya bulan ni, 20 jam tapi dapat RM100 je",
    ask: "Check my case",
    speakIn: "Speak",
    listening: "Listening…",
    tryLabel: "Try:",
    you: "You",
    language: "Language",
    caseLabel: "Case",
    steps: {
      understand: "Understand your message",
      clarify: "Check what is missing",
      calculate: "Calculate with the law",
      route: "Pick the right agency",
      draft: "Write a formal BM report",
      prefill: "Prepare the complaint form",
      handoff: "Hand over to you",
    } as Record<AgentStepId, string>,
    needsAnswer: "Needs your answer",
    answer: "Continue",
    typeNumber: "Type a number",
    upload: "Go to the payroll check",
    owed: "Estimated amount owed to you",
    engineNote: "Calculated by Hakku's engines from the law, not by AI.",
    verified: "Confirmed",
    potential: "Likely, needs your proof",
    info: "Good to know",
    nothing: "Good news: from what you told us, nothing looks underpaid.",
    report: "Your formal report in Bahasa Melayu",
    subject: "Subject",
    attachments: "Documents to attach",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    stop: "Stop",
    voiceNear: "Your device has no voice for this language, so the closest one is used.",
    voiceNone: "This browser cannot read text aloud. Please try Chrome, Edge or Safari.",
    sendTitle: "How do you want to send it?",
    wa: "WhatsApp",
    waSub: "Copy and paste",
    email: "Email",
    emailSub: "Opens in Gmail",
    jtk: "Report to JTKSM",
    jtkSub: "Labour Department",
    waStep: "Copy the message, open WhatsApp and paste it into your chat with them.",
    to: "To",
    toPh: "e.g. hr@company.com.my",
    gmail: "Open in Gmail",
    otherMail: "Use another email app",
    emailNeed: "Type their email address first.",
    emailNote: "Gmail opens with the message already written. Check it, then press Send.",
    jtkText: "Hakku has written the complaint in formal Bahasa Melayu and filled in the form. You only need to check it, add your IC and phone number, and submit.",
    jtkGo: "Check and submit my report",
    yourTurn: "Hakku never logs in or sends anything for you. You check it and press Send yourself.",
    again: "Ask about something else",
    error: "Something went wrong. Please try again.",
    demo: "Demo mode: ILMU is not connected, so Hakku's built-in rules were used.",
  },
  bm: {
    title: "Ceritakan kepada Hakku apa yang berlaku",
    sub: "Tulis seperti anda bercerita kepada kawan, dalam BM, English, 中文 atau தமிழ். Hakku uruskan selebihnya.",
    placeholder: "cth. Boss tak bayar OT saya bulan ni, 20 jam tapi dapat RM100 je",
    ask: "Semak kes saya",
    speakIn: "Cakap",
    listening: "Sedang mendengar…",
    tryLabel: "Cuba:",
    you: "Anda",
    language: "Bahasa",
    caseLabel: "Kes",
    steps: {
      understand: "Faham mesej anda",
      clarify: "Semak maklumat yang kurang",
      calculate: "Kira ikut undang-undang",
      route: "Pilih agensi yang betul",
      draft: "Tulis laporan BM rasmi",
      prefill: "Sediakan borang aduan",
      handoff: "Serahkan kepada anda",
    } as Record<AgentStepId, string>,
    needsAnswer: "Perlu jawapan anda",
    answer: "Teruskan",
    typeNumber: "Taip nombor",
    upload: "Pergi ke semakan senarai gaji",
    owed: "Anggaran jumlah terhutang kepada anda",
    engineNote: "Dikira oleh enjin Hakku ikut undang-undang, bukan oleh AI.",
    verified: "Disahkan",
    potential: "Berkemungkinan, perlu bukti",
    info: "Untuk makluman",
    nothing: "Berita baik: berdasarkan maklumat anda, tiada bayaran yang terkurang.",
    report: "Laporan rasmi anda dalam Bahasa Melayu",
    subject: "Perkara",
    attachments: "Dokumen untuk dilampirkan",
    copy: "Salin",
    copied: "Disalin",
    listen: "Dengar",
    stop: "Henti",
    voiceNear: "Peranti anda tiada suara untuk bahasa ini, jadi suara yang paling hampir digunakan.",
    voiceNone: "Pelayar ini tidak dapat membaca teks. Sila cuba Chrome, Edge atau Safari.",
    sendTitle: "Bagaimana anda mahu menghantarnya?",
    wa: "WhatsApp",
    waSub: "Salin dan tampal",
    email: "E-mel",
    emailSub: "Dibuka dalam Gmail",
    jtk: "Lapor kepada JTKSM",
    jtkSub: "Jabatan Tenaga Kerja",
    waStep: "Salin mesej, buka WhatsApp dan tampal dalam perbualan dengan mereka.",
    to: "Kepada",
    toPh: "cth. hr@syarikat.com.my",
    gmail: "Buka dalam Gmail",
    otherMail: "Guna aplikasi e-mel lain",
    emailNeed: "Taip alamat e-mel mereka dahulu.",
    emailNote: "Gmail dibuka dengan mesej yang sudah ditulis. Semak, kemudian tekan Hantar.",
    jtkText: "Hakku telah menulis aduan dalam Bahasa Melayu rasmi dan mengisi borang. Anda hanya perlu menyemak, mengisi No. KP dan nombor telefon, kemudian menghantar.",
    jtkGo: "Semak dan hantar laporan saya",
    yourTurn: "Hakku tidak sekali-kali log masuk atau menghantar bagi pihak anda. Anda semak dan tekan Hantar sendiri.",
    again: "Tanya perkara lain",
    error: "Ada masalah. Sila cuba lagi.",
    demo: "Mod demo: ILMU tidak disambungkan, jadi peraturan terbina Hakku digunakan.",
  },
} as const;

const LANG_NAME = { en: "English", ms: "Bahasa Melayu", zh: "中文", ta: "தமிழ்" };
const CASE_NAME: Record<string, [string, string]> = {
  employee: ["Employee", "Pekerja"],
  part_time: ["Part-time", "Kerja sambilan"],
  gig_rider: ["Gig rider", "Rider gig"],
  freelancer: ["Freelancer", "Freelancer"],
  sme: ["Business owner", "Pemilik perniagaan"],
};
const SAMPLES = [
  "我做兼职，时薪RM7.50，这个月80小时，老板排班",
  "Grab gantung akaun saya 19 hari, purata RM110 sehari",
  "Gaji pokok saya RM1,800, buat OT 20 jam tapi dapat RM100 je",
  "Client still hasn't paid my RM2,800 invoice, work done 45 days ago",
];
const STEP_ORDER: AgentStepId[] = ["understand", "clarify", "calculate", "route", "draft", "prefill", "handoff"];
const rm = (n: number) => "RM" + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Channel = "wa" | "email" | "jtk";

export default function TanyaPage() {
  const router = useRouter();
  const { locale, ilmuMode } = useHakku();
  const lc: Lc = locale === "bm" ? "bm" : "en";
  const tx = TX[lc];

  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<AgentRequest["answers"]>({});
  const [res, setRes] = useState<AgentResponse | null>(null);
  const [shown, setShown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [channel, setChannel] = useState<Channel>("wa");
  const [emailTo, setEmailTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNote, setVoiceNote] = useState<SpeakResult | null>(null);
  const [listening, setListening] = useState(false);
  const [micHint, setMicHint] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => () => {
    clearTimers();
    stopSpeaking();
  }, []);

  const run = useCallback(
    async (msg: string, ans: AgentRequest["answers"], fromStep = 0) => {
      clearTimers();
      setLoading(true);
      setError(false);
      setMessage(msg);
      setAnswers(ans);
      setAnswerDraft("");
      setCopied(false);
      try {
        const r = await callHakkuAgent({ message: msg, answers: ans, mode: ilmuMode });
        setRes(r);
        // Reveal the steps one by one so the user can follow what Hakku is doing.
        const last = r.steps.findIndex((s) => s.status === "needs_input");
        const stop = last === -1 ? STEP_ORDER.length : last + 1;
        setShown(fromStep);
        for (let i = fromStep + 1; i <= stop; i++) {
          timers.current.push(window.setTimeout(() => setShown(i), (i - fromStep) * 450));
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [ilmuMode]
  );

  // Home page hands over the prompt as ?q= (run once, even in React strict mode).
  const startedFromUrl = useRef(false);
  useEffect(() => {
    if (startedFromUrl.current) return;
    startedFromUrl.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mic") === "1") setMicHint(true);
    const q = params.get("q");
    if (q && q.trim()) {
      setDraft(q);
      void run(q.trim(), {});
    }
  }, [run]);

  const start = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setRes(null);
    void run(msg, {});
  };

  const listen = () => {
    const rec = createRecognizer(lc === "bm" ? "ms-MY" : "en-MY");
    if (!rec) return;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setDraft((d) => (d ? `${d} ${text}` : text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    setMicHint(false);
    rec.start();
  };
  // Checked after mount so the server and browser render the same HTML first.
  const [canListen, setCanListen] = useState(false);
  useEffect(() => setCanListen(!!createRecognizer("en-MY")), []);

  const question = res && shown >= 1 ? res.questions[0] : undefined;
  const answer = (key: AgentFactKey, value: string) => {
    if (!value.trim()) return;
    void run(message, { ...answers, [key]: value }, 2);
  };

  const done = !!res && res.questions.length === 0 && shown >= 3;
  const report = res?.report ?? null;
  const reportText = report
    ? `Perkara: ${report.perkara}\n\n${report.body}\n\nLampiran:\n${report.lampiran.map((x, i) => `${i + 1}. ${x}`).join("\n")}`
    : "";

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      /* the text is still visible to select */
    }
    setCopied(true);
  };

  const toggleListen = async () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!report) return;
    setSpeaking(true);
    const result = await speak(`${report.perkara}. ${report.body}`, "ms-MY", () => setSpeaking(false));
    setVoiceNote(result === "ok" ? null : result);
    if (result === "none") setSpeaking(false);
  };

  const emailDraft = { to: emailTo, subject: report?.perkara ?? "", body: report?.body ?? "" };
  const gmail = buildGmailComposeUrl(emailDraft);
  const mailto = buildMailtoUrl(emailDraft);
  const pack = res ? buildJtksmReportPack(res) : null;

  const goJtksm = () => {
    if (!pack) return;
    saveReportPack(pack);
    router.push("/lapor");
  };

  const reset = () => {
    clearTimers();
    stopSpeaking();
    setRes(null);
    setShown(0);
    setDraft("");
    setMessage("");
    setAnswers({});
  };

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      {!res && (
        <section className="space-y-4">
          <h1 className="hk-in font-body text-[32px] font-bold leading-tight tracking-tight">{tx.title}</h1>
          <p className="text-body-md text-txt-black-700">{tx.sub}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(draft);
            }}
            className="rounded-xl border border-otl-gray-200 bg-bg-white p-3 shadow-card"
          >
            <label htmlFor="tanya-input" className="sr-only">
              {tx.title}
            </label>
            <textarea
              id="tanya-input"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={tx.placeholder}
              className="w-full resize-none border-0 bg-transparent p-2 text-body-lg outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              {canListen ? (
                <button
                  type="button"
                  onClick={listen}
                  className={
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-body-sm font-semibold " +
                    (micHint || listening ? "animate-pulse border-[#2563EB] bg-bg-primary-50 text-txt-primary" : "border-otl-gray-200")
                  }
                >
                  <Mic className="h-4 w-4 text-txt-primary" />
                  {listening ? tx.listening : tx.speakIn}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={loading || !draft.trim()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bg-primary-600 px-5 text-body-md font-semibold text-white disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {tx.ask}
              </button>
            </div>
          </form>
          <div className="flex flex-wrap items-center gap-2 text-body-sm text-txt-black-700">
            <span>{tx.tryLabel}</span>
            {SAMPLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setDraft(s);
                  start(s);
                }}
                className="min-h-10 rounded-full border border-otl-gray-200 bg-bg-white px-3 py-1 text-left"
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="text-body-sm text-txt-danger">{tx.error}</p>}
        </section>
      )}

      {res && (
        <>
          <div className="hk-in ml-auto w-fit max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-bg-primary-600 px-4 py-3 text-body-md text-white">
            {message}
          </div>
          <div className="flex flex-wrap gap-2 text-body-xs font-semibold">
            <span className="rounded-full bg-bg-primary-50 px-3 py-1 text-txt-primary">
              {tx.language} · {LANG_NAME[res.language]}
            </span>
            {res.caseType && shown >= 1 && (
              <span className="rounded-full border border-otl-gray-200 px-3 py-1">
                {tx.caseLabel} · {CASE_NAME[res.caseType][lc === "bm" ? 1 : 0]}
              </span>
            )}
          </div>
          {res.fallbackNotice && <p className="text-body-xs text-txt-black-500">{tx.demo}</p>}

          <ol className="hk-in hk-d2 rounded-xl border border-otl-gray-200 bg-bg-white px-4 py-2" aria-live="polite">
            {STEP_ORDER.map((id, i) => {
              const step = res.steps.find((s) => s.id === id);
              // "handoff" waiting means it is the user's turn to send, not a missing answer.
              const waiting = step?.status === "needs_input" && id !== "handoff" && shown > i;
              const isDone = shown > i && !waiting;
              const now = shown === i && !waiting;
              return (
                <li key={id} className="flex min-h-10 items-center gap-3 text-body-md">
                  <span className="flex h-5 w-5 items-center justify-center">
                    {isDone ? (
                      <Check className="h-5 w-5 text-txt-success" />
                    ) : waiting ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-warning-50 text-body-xs font-bold text-txt-warning">?</span>
                    ) : now ? (
                      <Loader2 className="h-4 w-4 animate-spin text-txt-primary" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full border-2 border-otl-gray-300" />
                    )}
                  </span>
                  <span className={isDone ? "" : waiting ? "font-semibold text-txt-warning" : now ? "font-semibold text-txt-primary" : "text-txt-black-500"}>
                    {tx.steps[id]}
                  </span>
                  {waiting && <span className="ml-auto text-body-xs text-txt-warning">{tx.needsAnswer}</span>}
                </li>
              );
            })}
          </ol>

          {question && (
            <section className="hk-in space-y-3 rounded-xl border-2 border-otl-warning-200 bg-bg-white p-4">
              <p className="text-body-lg font-semibold">{question.text}</p>
              {question.kind === "number" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    answer(question.key, answerDraft.replace(/[^0-9.]/g, ""));
                  }}
                  className="flex gap-2"
                >
                  <input
                    aria-label={question.text}
                    inputMode="decimal"
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    placeholder={tx.typeNumber}
                    className="h-12 min-w-0 flex-1 rounded-lg border border-otl-gray-200 px-3 text-body-lg"
                  />
                  <button type="submit" disabled={loading} className="min-h-12 rounded-lg bg-bg-primary-600 px-5 font-semibold text-white">
                    {tx.answer}
                  </button>
                </form>
              )}
              {(question.kind === "choice" || question.kind === "yes_no") && (
                <div className="flex flex-wrap gap-2">
                  {question.options?.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => answer(question.key, o.value)}
                      className="min-h-12 rounded-lg border border-otl-gray-200 px-4 font-semibold"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
              {question.kind === "upload" && (
                <button type="button" onClick={() => router.push("/workspace?role=sme")} className="min-h-12 rounded-lg bg-bg-primary-600 px-5 font-semibold text-white">
                  {tx.upload}
                </button>
              )}
            </section>
          )}

          {done && res.findings.length === 0 && (
            <p className="rounded-xl bg-bg-success-50 p-4 text-body-md font-semibold">{tx.nothing}</p>
          )}

          {done && res.findings.length > 0 && (
            <section className="space-y-3">
              <div className="text-center">
                <p className="text-body-sm font-semibold text-txt-black-700">{tx.owed}</p>
                <p className="hk-pop font-body text-[44px] font-bold tracking-tight text-txt-danger">{rm(res.totalRm)}</p>
                <p className="text-body-xs text-txt-black-500">{tx.engineNote}</p>
              </div>
              {res.findings.map((f, i) => (
                <article key={i} className="hk-in space-y-2 rounded-xl border border-otl-gray-200 bg-bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-body-lg font-semibold">{lc === "bm" ? f.titleMs : f.titleEn}</h2>
                    {f.amountRm > 0 && <span className="whitespace-nowrap text-body-lg font-semibold">+{rm(f.amountRm)}</span>}
                  </div>
                  <p className="text-body-md leading-relaxed text-txt-black-700">{lc === "bm" ? f.workingMs : f.workingEn}</p>
                  <div className="flex flex-wrap items-center gap-2 text-body-xs">
                    <span
                      className={
                        f.level === "verified"
                          ? "rounded-full bg-bg-danger-50 px-2.5 py-0.5 font-semibold text-txt-danger"
                          : f.level === "potential"
                            ? "rounded-full bg-bg-warning-50 px-2.5 py-0.5 font-semibold text-txt-warning"
                            : "rounded-full bg-bg-primary-50 px-2.5 py-0.5 font-semibold text-txt-primary"
                      }
                    >
                      {tx[f.level]}
                    </span>
                    <span className="text-txt-black-500">{f.citation}</span>
                  </div>
                </article>
              ))}
            </section>
          )}

          {report && shown >= 5 && (
            <section lang="ms" className="hk-in overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-white">
              <div className="bg-bg-primary-50 px-4 py-3 text-body-sm font-semibold text-txt-primary">{tx.report}</div>
              <div className="space-y-3 p-4">
                <p className="text-body-md">
                  <strong>{tx.subject}:</strong> <strong className="underline">{report.perkara}</strong>
                </p>
                <p className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-otl-gray-200 pt-3 text-body-sm leading-relaxed text-txt-black-700">
                  {report.body}
                </p>
                <div className="text-body-sm">
                  <strong>{tx.attachments}:</strong>
                  <ol className="list-decimal pl-5">
                    {report.lampiran.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={copyReport} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-otl-gray-200 font-semibold">
                    <Copy className="h-4 w-4" />
                    {copied ? tx.copied : tx.copy}
                  </button>
                  <button type="button" onClick={toggleListen} aria-pressed={speaking} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-otl-gray-200 font-semibold">
                    {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {speaking ? tx.stop : tx.listen}
                  </button>
                </div>
                {voiceNote && (
                  <p role="status" className="rounded-lg bg-bg-warning-50 px-3 py-2 text-body-xs text-txt-warning">
                    {voiceNote === "none" ? tx.voiceNone : tx.voiceNear}
                  </p>
                )}
              </div>
            </section>
          )}

          {report && shown >= STEP_ORDER.length && (
            <section className="space-y-3">
              <h2 className="text-body-lg font-semibold">{tx.sendTitle}</h2>
              <div role="radiogroup" aria-label={tx.sendTitle} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(
                  [
                    ["wa", tx.wa, tx.waSub, MessageCircle],
                    ["email", tx.email, tx.emailSub, Mail],
                    ...(pack ? ([["jtk", tx.jtk, tx.jtkSub, Landmark]] as const) : []),
                  ] as const
                ).map(([id, label, sub, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={channel === id}
                    onClick={() => setChannel(id)}
                    className={
                      "flex min-h-16 items-center gap-3 rounded-xl px-4 text-left " +
                      (channel === id ? "border-2 border-otl-primary-300 bg-bg-primary-50 text-txt-primary" : "border border-otl-gray-200 bg-bg-white")
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>
                      <span className="block font-semibold">{label}</span>
                      <span className="block text-body-xs opacity-80">{sub}</span>
                    </span>
                  </button>
                ))}
              </div>

              {channel === "wa" && (
                <div className="space-y-3">
                  <p className="text-body-md text-txt-black-700">{tx.waStep}</p>
                  <button type="button" onClick={copyReport} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-bg-success-600 text-body-lg font-semibold text-white">
                    <Copy className="h-5 w-5" />
                    {copied ? tx.copied : tx.copy}
                  </button>
                </div>
              )}

              {channel === "email" && (
                <div className="space-y-3">
                  <label className="flex min-h-14 items-center gap-3 rounded-xl border border-otl-gray-200 bg-bg-white px-4">
                    <span className="text-body-sm font-semibold text-txt-black-700">{tx.to}</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder={tx.toPh}
                      className="h-11 min-w-0 flex-1 bg-transparent text-body-lg outline-none"
                    />
                  </label>
                  {!isValidEmail(emailTo) && <p className="text-body-sm text-txt-warning">{tx.emailNeed}</p>}
                  <a
                    href={gmail ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!gmail}
                    className={
                      "flex min-h-14 items-center justify-center rounded-xl text-body-lg font-semibold " +
                      (gmail ? "bg-bg-primary-600 text-white" : "pointer-events-none bg-bg-washed text-txt-black-500")
                    }
                  >
                    {tx.gmail}
                  </a>
                  <a
                    href={mailto ?? undefined}
                    aria-disabled={!mailto}
                    className={"flex min-h-12 items-center justify-center rounded-xl border border-otl-gray-200 font-semibold " + (mailto ? "" : "pointer-events-none opacity-50")}
                  >
                    {tx.otherMail}
                  </a>
                  <p className="text-center text-body-xs text-txt-black-500">{tx.emailNote}</p>
                </div>
              )}

              {channel === "jtk" && pack && (
                <div className="space-y-3 rounded-xl border-2 border-otl-primary-300 bg-bg-white p-4">
                  <p className="text-body-md leading-relaxed text-txt-black-700">{tx.jtkText}</p>
                  <button type="button" onClick={goJtksm} className="min-h-14 w-full rounded-xl bg-bg-primary-600 text-body-lg font-semibold text-white">
                    {tx.jtkGo} ›
                  </button>
                </div>
              )}
              <p className="text-center text-body-xs text-txt-black-500">{tx.yourTurn}</p>
            </section>
          )}

          <button type="button" onClick={reset} className="min-h-12 w-full rounded-xl border border-otl-gray-200 font-semibold">
            {tx.again}
          </button>
        </>
      )}
    </main>
  );
}
