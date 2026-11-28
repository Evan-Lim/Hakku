// Step 6 hand-off helpers: WhatsApp copy, Gmail compose, and the JTKSM report pack.
// Nothing here sends anything. Each helper only prepares text or a link; the user presses Send/Submit.

import type { AgentResponse, PortalField, PortalId } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(address: string): boolean {
  return EMAIL_RE.test(address.trim());
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

/** Opens Gmail's compose window with recipient, subject and body already filled in. */
export function buildGmailComposeUrl({ to, subject, body }: EmailDraft): string | null {
  if (!isValidEmail(to)) return null;
  const q = new URLSearchParams({ view: "cm", fs: "1", to: to.trim(), su: subject, body });
  return `https://mail.google.com/mail/?${q.toString()}`;
}

/** Fallback for Outlook, Apple Mail and other mail apps. */
export function buildMailtoUrl({ to, subject, body }: EmailDraft): string | null {
  if (!isValidEmail(to)) return null;
  return `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** WhatsApp is copy-and-paste in the UI; this link is an optional shortcut that opens WhatsApp with the text. */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface JtksmReportPack {
  version: 1;
  portalId: PortalId;
  agencyMs: string;
  officialUrl: string;
  perkara: string;
  fields: PortalField[];
  attachments: string[];
  totalRm: number;
  createdAt: string;
}

/** Turns an agent result into the pre-filled report the user checks on /lapor before submitting. */
export function buildJtksmReportPack(res: AgentResponse, now: Date = new Date()): JtksmReportPack | null {
  const plan = res.portals.find((p) => p.portalId === "wfw" || p.portalId === "gig_eaduan");
  if (!plan || !res.report) return null;
  return {
    version: 1,
    portalId: plan.portalId,
    agencyMs: plan.agencyMs,
    officialUrl: plan.officialUrl,
    perkara: res.report.perkara,
    fields: plan.fields.map((f) => ({ ...f })),
    attachments: [...plan.attachments],
    totalRm: res.totalRm,
    createdAt: now.toISOString(),
  };
}

/** Fields the user still has to fill in themselves (name, IC, phone, declaration). */
export function missingUserFields(fields: PortalField[]): PortalField[] {
  return fields.filter((f) => f.filledBy === "user" && f.key !== "declaration" && !f.value.trim());
}

const STORAGE_KEY = "hakku.reportPack.v1";

/** Kept in sessionStorage only: it disappears when the tab closes and never leaves the device. */
export function saveReportPack(pack: JtksmReportPack): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pack));
  } catch {
    /* storage unavailable (private mode): the page falls back to an empty state */
  }
}

export function loadReportPack(): JtksmReportPack | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const pack = JSON.parse(raw) as JtksmReportPack;
    return pack?.version === 1 && Array.isArray(pack.fields) ? pack : null;
  } catch {
    return null;
  }
}

export function clearReportPack(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
