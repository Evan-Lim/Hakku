import { NextResponse } from "next/server";
import { hasLiveIlmuCredentials, ILMU_CONFIG } from "@/lib/ilmu/client";

export async function GET() {
  return NextResponse.json({
    credentialsConfigured: hasLiveIlmuCredentials(),
    baseUrl: ILMU_CONFIG.baseUrl,
    models: {
      chat: ILMU_CONFIG.chatModel,
      vision: ILMU_CONFIG.visionModel,
      asr: ILMU_CONFIG.asrModel,
      tts: ILMU_CONFIG.ttsModel,
      embedding: ILMU_CONFIG.embeddingModel,
    },
    residency: "Malaysia Onshore (YTL AI Cloud)",
  });
}
