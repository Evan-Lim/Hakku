import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getIlmuClient,
  ILMU_CONFIG,
  resolveEffectiveMode,
} from "@/lib/ilmu/client";
import { runDemoOcr } from "@/lib/ilmu/demoEngine";

const ocrRequestSchema = z.object({
  mode: z.enum(["demo", "live"]).optional(),
  persona: z.enum(["freelancer", "sme", "worker"]).default("worker"),
  documentType: z
    .enum(["payslip", "gig_payout", "employment_contract", "workspace_lease"])
    .default("payslip"),
  imageBase64: z.string().optional(),
  fileName: z.string().optional(),
  scenarioHint: z.string().optional(),
  maskPii: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ocrRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid OCR request payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { mode, persona, documentType, imageBase64, fileName, scenarioHint, maskPii } =
      parsed.data;
    const resolution = resolveEffectiveMode(mode);

    if (resolution.activeMode === "live" && imageBase64) {
      const client = getIlmuClient();
      if (client) {
        try {
          const completion = await client.chat.completions.create({
            model: ILMU_CONFIG.visionModel,
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content:
                  "You are Hakku's onshore Malaysian document parser. Extract structured JSON fields only (basicSalaryRm, allowanceRm, otHours, otPaidRm, epfEmployeeRm, epfEmployerRm, socsoEmployeeRm, lindung24JamRm, invoiceAmountRm, daysElapsed, monthlyRentRm, tenancyYears, maskedIdentifier). Never fabricate numbers.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Extract fields for persona=${persona}, documentType=${documentType}, fileName=${fileName ?? "upload"}, maskPii=${String(maskPii)}. Return valid JSON only.`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageBase64 },
                  },
                ],
              },
            ],
          });

          const rawText = completion.choices[0]?.message?.content ?? "{}";
          return NextResponse.json({
            executionMode: "live",
            modelUsed: ILMU_CONFIG.visionModel,
            residency: "Malaysia Onshore (YTL ILMU Sovereign Cloud)",
            piiMasked: maskPii,
            rawText,
          });
        } catch (err) {
          console.warn("ILMU Vision fallback triggered:", err);
        }
      }
    }

    return NextResponse.json(
      runDemoOcr({
        persona,
        documentType,
        fileName,
        scenarioHint,
        maskPii,
        fallbackNotice: resolution.fallbackNotice,
      })
    );
  } catch {
    return NextResponse.json({ error: "Failed to parse OCR request" }, { status: 500 });
  }
}
