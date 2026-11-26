import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getIlmuClient,
  ILMU_CONFIG,
  resolveEffectiveMode,
} from "@/lib/ilmu/client";
import { rankStatutoryCorpus, runDemoRag } from "@/lib/ilmu/demoEngine";

const ragSchema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  locale: z.enum(["en", "bm"]).default("en"),
  persona: z.enum(["freelancer", "sme", "worker"]).default("freelancer"),
  query: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ragSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const { mode, locale, persona, query } = parsed.data;
    const resolution = resolveEffectiveMode(mode);
    const matchedEntries = rankStatutoryCorpus(persona, query);

    if (resolution.activeMode === "live") {
      const client = getIlmuClient();
      if (client) {
        try {
          const contextText = matchedEntries
            .map(
              (m) =>
                `[${m.citation.act} — ${m.citation.section}]: ${
                  locale === "bm" ? m.practicalGuidanceBm : m.practicalGuidanceEn
                }`
            )
            .join("\n");

          const completion = await client.chat.completions.create({
            model: ILMU_CONFIG.chatModel,
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "You are Hakku's constructive Malaysian statutory guide. Answer clearly, warmly, and strictly grounded in the retrieved 2026 statutory sections. Always cite exact Acts and encourage calm resolution first.",
              },
              {
                role: "user",
                content: `Language: ${locale}\nPersona: ${persona}\nRetrieved Statutory Context:\n${contextText}\n\nQuestion: ${query}`,
              },
            ],
          });

          return NextResponse.json({
            executionMode: "live",
            embeddingModel: ILMU_CONFIG.embeddingModel,
            chatModel: ILMU_CONFIG.chatModel,
            answer: completion.choices[0]?.message?.content ?? "",
            citations: matchedEntries.map((m) => m.citation),
          });
        } catch (err) {
          console.warn("ILMU RAG fallback triggered:", err);
        }
      }
    }

    return NextResponse.json(
      runDemoRag({
        locale,
        persona,
        query,
        fallbackNotice: resolution.fallbackNotice,
      })
    );
  } catch {
    return NextResponse.json({ error: "RAG query failed" }, { status: 500 });
  }
}
