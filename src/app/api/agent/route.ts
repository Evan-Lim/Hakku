// POST /api/agent — one-prompt agent. Any language in, formal BM report + portal fill plan out.
// Live mode: ILMU (ilmu-v3.1) extracts facts (guarded: numbers must appear in the user's text)
// and polishes the BM letter (guarded: ringgit amounts must be unchanged). All RM amounts
// come from the TypeScript engines via runAgent — the LLM never calculates money.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIlmuClient, ILMU_CONFIG, resolveEffectiveMode } from "@/lib/ilmu/client";
import { runAgent } from "@/lib/agent/runAgent";
import { classifyCase, guardFactsAgainstText } from "@/lib/agent/understand";
import { checkAmountsPreserved } from "@/lib/agent/report";
import type { AgentCaseType, AgentFacts } from "@/lib/agent/types";

const CASE_TYPES = ["employee", "part_time", "gig_rider", "freelancer", "sme"] as const;

const agentSchema = z.object({
  message: z.string().min(1).max(4000),
  mode: z.enum(["demo", "live"]).optional(),
  answers: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  caseTypeHint: z.enum(CASE_TYPES).optional(),
});

const EXTRACT_PROMPT = `You extract facts from a Malaysian worker's or business owner's message (any language: Malay, English, Chinese, Tamil, Manglish).
Return ONLY JSON: {"caseType": one of ${CASE_TYPES.join("|")} or null, "facts": {basicSalaryRm, fixedAllowanceRm, otHours, otPaidRm, optedOutLindung, hourlyRateRm, hoursThisMonth, bossSetsShifts, suspensionDays, averageDailyEarningsRm, pendingPayoutRm, daysSinceWorkCompleted, invoiceAmountRm, hasPaymentTerm, counterpartyName}}.
Only include a number if the user literally wrote it. Never compute, estimate or convert amounts. Omit unknown keys.`;

const POLISH_PROMPT = `Anda penyunting surat rasmi kerajaan Malaysia. Perbaiki bahasa surat aduan ini supaya menggunakan Bahasa Melayu rasmi yang betul dan sopan.
JANGAN ubah, tambah atau buang sebarang angka, jumlah RM, nama akta, seksyen atau tanda kurung segi empat seperti [nama penuh]. Kembalikan surat sahaja.`;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = agentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid agent payload" }, { status: 400 });

  const data = parsed.data;
  const resolution = resolveEffectiveMode(data.mode);
  const client = resolution.activeMode === "live" ? getIlmuClient() : null;

  if (!client) {
    return NextResponse.json({ ...runAgent(data), fallbackNotice: resolution.fallbackNotice });
  }

  try {
    // 1) Understand with ILMU, then keep only numbers the user actually typed.
    const extraction = await client.chat.completions.create({
      model: ILMU_CONFIG.chatModel,
      temperature: 0,
      messages: [{ role: "system", content: EXTRACT_PROMPT }, { role: "user", content: data.message }],
    });
    const raw = extraction.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1) || "{}") as { caseType?: AgentCaseType | null; facts?: AgentFacts };
    const llmFacts = guardFactsAgainstText(json.facts ?? {}, data.message);
    const caseTypeHint = data.caseTypeHint ?? (CASE_TYPES.includes(json.caseType as AgentCaseType) ? (json.caseType as AgentCaseType) : classifyCase(data.message) ?? undefined);

    // Facts from ILMU fill gaps; explicit answers from the UI always win.
    const answers = { ...Object.fromEntries(Object.entries(llmFacts).map(([k, v]) => [k, v as string | number | boolean])), ...(data.answers ?? {}) };
    const result = runAgent({ ...data, caseTypeHint, answers });
    const live = { ...result, executionMode: "live" as const, modelUsed: ILMU_CONFIG.chatModel };

    // 2) Polish the formal BM letter, but only accept it if every RM amount is unchanged.
    if (result.report) {
      const polish = await client.chat.completions.create({
        model: ILMU_CONFIG.chatModel,
        temperature: 0.2,
        messages: [{ role: "system", content: POLISH_PROMPT }, { role: "user", content: result.report.body }],
      });
      const text = polish.choices[0]?.message?.content?.trim() ?? "";
      if (text && checkAmountsPreserved(text, result.report.amountsUsedRm)) {
        live.report = { ...result.report, body: text };
        live.portals = live.portals.map((p) => ({ ...p, fields: p.fields.map((f) => (f.key === "description" ? { ...f, value: text } : f)) }));
      }
    }
    return NextResponse.json(live);
  } catch (err) {
    console.warn("ILMU agent fallback triggered:", err);
    return NextResponse.json({ ...runAgent(data), fallbackNotice: "ILMU tidak dapat dihubungi; keputusan dijana oleh enjin Hakku." });
  }
}
