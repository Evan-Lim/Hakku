import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getIlmuClient,
  ILMU_CONFIG,
  resolveEffectiveMode,
} from "@/lib/ilmu/client";
import { runDemoTts } from "@/lib/ilmu/demoEngine";

const ttsSchema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  locale: z.enum(["en", "bm"]).default("bm"),
  text: z.string().min(2).max(1500),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ttsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid TTS payload" }, { status: 400 });
    }

    const { mode, locale, text } = parsed.data;
    const resolution = resolveEffectiveMode(mode);

    if (resolution.activeMode === "live") {
      const client = getIlmuClient();
      if (client) {
        try {
          const response = await client.audio.speech.create({
            model: ILMU_CONFIG.ttsModel,
            voice: "alloy",
            input: text,
          });
          const arrayBuffer = await response.arrayBuffer();
          const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
          return NextResponse.json({
            executionMode: "live",
            modelUsed: ILMU_CONFIG.ttsModel,
            audioDataUrl: `data:audio/mp3;base64,${audioBase64}`,
            fallbackSpeechText: text,
            locale,
          });
        } catch (err) {
          console.warn("ILMU TTS fallback triggered:", err);
        }
      }
    }

    return NextResponse.json(
      runDemoTts({
        locale,
        text,
        fallbackNotice: resolution.fallbackNotice,
      })
    );
  } catch {
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
