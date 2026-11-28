# For Evan: one-prompt agent backend (branch `be/agent-autofile`)

New files only. None of your existing files were edited.

| File | What it does |
|---|---|
| `src/lib/agent/types.ts` | Request/response types for the agent and submit routes |
| `src/lib/agent/understand.ts` | Detects language (en/ms/zh/ta), case type and facts from one message; asks follow-up questions in the user's language |
| `src/lib/agent/runAgent.ts` | Pure orchestrator: understand → clarify → calculate (your engines) → route → formal BM report → portal fill plan → hand-off |
| `src/lib/agent/report.ts` | Formal BM letter template + `checkAmountsPreserved` guard for ILMU polish |
| `src/lib/agent/portals.ts` | Agency routing (WFW, gig e-Aduan, MyTax, KWSP), field-by-field fill plan, mirror reference |
| `src/lib/agent/agentBridge.ts` | `callHakkuAgent` / `callHakkuAgentSubmit`, with in-browser fallback for the static Netlify export |
| `src/lib/engines/partTimeEngine.ts` | Part-time hourly rate vs RM8.72 (Minimum Wages Order 2024) |
| `src/app/api/agent/route.ts` | `POST /api/agent`. Live: ILMU extracts facts (numbers kept only if the user typed them) and polishes the BM letter (rejected if any RM amount changes) |
| `src/app/api/agent/submit/route.ts` | `POST /api/agent/submit`. Mirror only, needs `consentConfirmed: true`; `target: "official"` returns 400 |
| `src/lib/agent/handoff.ts` | Step 6 hand-off: Gmail compose link, mailto fallback, WhatsApp text link, and the JTKSM report pack (kept in sessionStorage only) |
| `src/app/lapor/page.tsx` | `/lapor` page: shows the pre-filled JTKSM report, user adds name/IC/phone, ticks the declaration and submits to the Hakku mirror; button to open the official WFW / e-Aduan portal with Copy buttons per field |
| `src/tests/agent.test.ts`, `src/tests/handoff.test.ts` | Vitest cases |

## How the frontend uses it
```ts
const res = await callHakkuAgent({ message });          // one prompt, any language
const pack = buildJtksmReportPack(res);                 // null if the agent still needs answers
if (pack) { saveReportPack(pack); router.push("/lapor"); }
const gmail = buildGmailComposeUrl({ to, subject: res.report!.perkara, body: res.report!.body });
```

## Rules kept
- All RM amounts come from the engines; the LLM never calculates money.
- Hakku never logs in, stores credentials, bypasses CAPTCHAs or submits to a real government portal. The user logs in with their own identity, reviews and presses Submit. Identity fields (name, IC, phone, address) are `filledBy: "user"`.
- `fieldMapVerified: false`: field labels are our best guess; check them against the real WFW / e-Aduan forms.

## Checked locally (node strip-types; vitest/tsc not run, no node_modules)
| Prompt | Result |
|---|---|
| "I work part-time at a cafe, RM7.50 an hour, 80 hours this month, boss sets my shifts" | en · part_time · RM97.60 · WFW |
| "我做兼职，时薪RM7.50，这个月80小时，老板排班" | zh · part_time · RM97.60 · WFW |
| "Grab gantung akaun saya 19 hari, purata RM110 sehari" | ms · gig_rider · RM1,045 (potential) · gig e-Aduan |
| "Klien tak bayar invois RM2,800, kerja siap 45 hari lalu" | ms · freelancer · RM2,800 |
| "Gaji pokok saya RM1,800, buat OT 20 jam tapi dapat RM100 je" | ms · employee · RM159.50 |
| "老板没给我加班费" | zh · asks basic salary, OT hours, OT paid (in Chinese) |

Please run `npm run test` and `npm run build` before merging.

## Please check
1. `src/data/statutory-2026/rules.ts` cites "Minimum Wages Order (2025/2026)". The order in force is the **Minimum Wages Order 2024, P.U.(A) 376/2024**. The BM report maps it correctly, but the source string should be fixed.
2. Does ILMU support tool/function calling? If it does, `/api/agent` can switch from JSON-in-text extraction to tools.
3. Add `/api/agent` and `/api/agent/submit` to the AGENTS.md API table when merging.
4. Hackathon: commits must be made 1–7 Dec, so commit this during build week.
