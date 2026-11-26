import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getIlmuClient,
  ILMU_CONFIG,
  resolveEffectiveMode,
} from "@/lib/ilmu/client";
import { buildSmoothDemoDraft } from "@/lib/ilmu/demoEngine";

const draftSchema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  locale: z.enum(["en", "bm"]).default("en"),
  persona: z.enum(["freelancer", "sme", "worker"]),
  draftKind: z.enum([
    "hr_clarification",
    "wfw_summary",
    "client_reminder",
    "gig_tribunal_dossier",
    "sme_staff_advisory",
    "pkps_stamp_cover",
  ]),
  partyName: z.string().default("User"),
  counterpartyName: z.string().default("Counterparty"),
  findingsSummary: z.array(z.string()).default([]),
  totalAmountRm: z.number().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = draftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid draft payload" }, { status: 400 });
    }

    const data = parsed.data;
    const resolution = resolveEffectiveMode(data.mode);

    if (resolution.activeMode === "live") {
      const client = getIlmuClient();
      if (client) {
        try {
          const completion = await client.chat.completions.create({
            model: ILMU_CONFIG.chatModel,
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content:
                  "You are Hakku's bilingual Malaysian workplace & enterprise drafting copilot. Write smooth, respectful, constructive letters/summaries grounded strictly in the provided verified findings and Ringgit amounts. Never invent numbers or use hostile legal threats.",
              },
              {
                role: "user",
                content: `Language: ${data.locale}\nKind: ${data.draftKind}\nFrom: ${data.partyName}\nTo: ${data.counterpartyName}\nVerified Amount: RM${data.totalAmountRm.toFixed(2)}\nFindings:\n${data.findingsSummary.join("\n")}`,
              },
            ],
          });
          const text = completion.choices[0]?.message?.content ?? "";
          if (text.trim().length > 0) {
            return NextResponse.json({
              executionMode: "live",
              modelUsed: ILMU_CONFIG.chatModel,
              title: buildSmoothDemoDraft(data).title,
              body: text,
            });
          }
        } catch (err) {
          console.warn("ILMU Draft fallback triggered:", err);
        }
      }
    }

    const demoDraft = buildSmoothDemoDraft(data);
    return NextResponse.json({
      executionMode: "demo",
      modelUsed: `${ILMU_CONFIG.chatModel} (Sovereign Sandbox)`,
      ...demoDraft,
      fallbackNotice: resolution.fallbackNotice,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
