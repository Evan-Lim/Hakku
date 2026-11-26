import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getIlmuClient,
  ILMU_CONFIG,
  resolveEffectiveMode,
} from "@/lib/ilmu/client";
import { runDemoAsr } from "@/lib/ilmu/demoEngine";

const asrRequestSchema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  persona: z.enum(["freelancer", "sme", "worker"]).default("freelancer"),
  scenarioId: z.string().optional(),
  audioBase64: z.string().optional(),
  customSpokenHint: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = asrRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ASR request" }, { status: 400 });
    }

    const { mode, persona, scenarioId, audioBase64, customSpokenHint } = parsed.data;
    const resolution = resolveEffectiveMode(mode);

    if (resolution.activeMode === "live" && audioBase64) {
      const client = getIlmuClient();
      if (client) {
        try {
          const cleanB64 = audioBase64.includes(",")
            ? audioBase64.split(",")[1]
            : audioBase64;
          const buffer = Buffer.from(cleanB64, "base64");
          const file = new File([buffer], "voice-note.webm", { type: "audio/webm" });
          const transcription = await client.audio.transcriptions.create({
            model: ILMU_CONFIG.asrModel,
            file,
          });
          return NextResponse.json({
            executionMode: "live",
            modelUsed: ILMU_CONFIG.asrModel,
            transcript: transcription.text,
            detectedLanguages: ["BM", "EN", "Manglish"],
          });
        } catch (err) {
          console.warn("ILMU ASR fallback triggered:", err);
        }
      }
    }

    return NextResponse.json(
      runDemoAsr({
        persona,
        scenarioId,
        customSpokenHint,
        fallbackNotice: resolution.fallbackNotice,
      })
    );
  } catch {
    return NextResponse.json({ error: "ASR processing failed" }, { status: 500 });
  }
}
