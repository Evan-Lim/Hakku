// POST /api/agent/submit — submit a filled form to a Hakku PORTAL MIRROR only.
// Real government portals are never submitted by Hakku: the user logs in with their own
// MyDigital ID / password, reviews the pre-filled form and presses Submit themselves.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mirrorReference } from "@/lib/agent/portals";

const submitSchema = z.object({
  portalId: z.enum(["wfw", "gig_eaduan", "mytax", "kwsp"]),
  target: z.enum(["mirror", "official"]),
  consentConfirmed: z.boolean(),
  fields: z.array(z.object({ key: z.string(), labelMs: z.string(), value: z.string().max(8000), filledBy: z.enum(["agent", "user"]) })).max(40),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid submit payload" }, { status: 400 });

  const data = parsed.data;
  if (data.target === "official") {
    return NextResponse.json(
      { error: "Hakku tidak menghantar ke portal rasmi. Sila log masuk sendiri, semak borang dan tekan Hantar." },
      { status: 400 }
    );
  }
  if (!data.consentConfirmed) {
    return NextResponse.json({ error: "Pengesahan pengguna diperlukan sebelum menghantar." }, { status: 400 });
  }
  return NextResponse.json(mirrorReference(data.portalId));
}
