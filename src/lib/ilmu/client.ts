import OpenAI from "openai";
import { IlmuExecutionMode } from "@/lib/engines/types";

export const ILMU_CONFIG = {
  baseUrl: process.env.ILMU_API_BASE_URL || "https://api.ytlailabs.tech/v1",
  apiKey: process.env.ILMU_API_KEY || "",
  chatModel: process.env.ILMU_CHAT_MODEL || "ilmu-v3.1",
  visionModel: process.env.ILMU_VISION_MODEL || "ilmu-vision-v1.3",
  asrModel: process.env.ILMU_ASR_MODEL || "ilmu-asr-v4.2",
  ttsModel: process.env.ILMU_TTS_MODEL || "ilmu-tts-v2",
  embeddingModel: process.env.ILMU_EMBEDDING_MODEL || "bge-m3",
};

export function hasLiveIlmuCredentials(): boolean {
  return Boolean(ILMU_CONFIG.apiKey && ILMU_CONFIG.apiKey.trim().length > 0);
}

export function getIlmuClient(): OpenAI | null {
  if (!hasLiveIlmuCredentials()) {
    return null;
  }
  return new OpenAI({
    apiKey: ILMU_CONFIG.apiKey,
    baseURL: ILMU_CONFIG.baseUrl,
  });
}

export function resolveEffectiveMode(
  requestedMode?: IlmuExecutionMode
): {
  activeMode: "live" | "demo";
  credentialsConfigured: boolean;
  fallbackNotice?: string;
} {
  const credentialsConfigured = hasLiveIlmuCredentials();
  if (requestedMode === "live" && credentialsConfigured) {
    return { activeMode: "live", credentialsConfigured: true };
  }
  if (requestedMode === "live" && !credentialsConfigured) {
    return {
      activeMode: "demo",
      credentialsConfigured: false,
      fallbackNotice:
        "Live ILMU_API_KEY is not configured in .env.local; automatically switched to Sovereign Demo Mode.",
    };
  }
  return { activeMode: "demo", credentialsConfigured };
}
