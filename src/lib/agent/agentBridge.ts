"use client";

// Client helpers for the one-prompt agent. On the static Netlify export (no API routes)
// the same pure pipeline runs in the browser, so the demo always works.

import { runAgent } from "./runAgent";
import { mirrorReference } from "./portals";
import type { AgentRequest, AgentResponse, AgentSubmitRequest, AgentSubmitResponse } from "./types";

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

async function post<T>(url: string, body: unknown): Promise<T | null> {
  if (IS_STATIC_EXPORT) return null;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function callHakkuAgent(req: AgentRequest): Promise<AgentResponse> {
  return (await post<AgentResponse>("/api/agent", req)) ?? runAgent(req);
}

export async function callHakkuAgentSubmit(req: AgentSubmitRequest): Promise<AgentSubmitResponse> {
  if (req.target !== "mirror" || !req.consentConfirmed) throw new Error("Only consented submissions to Hakku mirrors are allowed.");
  return (await post<AgentSubmitResponse>("/api/agent/submit", req)) ?? mirrorReference(req.portalId);
}
