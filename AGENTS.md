# AGENTS.md — Hakku Team Roles & AI Collaboration Rules

> For every AI coding agent (ILMUcode / Claude / Cursor / Copilot, etc.). **Read this file before writing any code.**
> Human teammates too 🙂

---

## 0. Project in one line

**Hakku** (Hak-ku = "my rights") — a labour-rights / compliance helper for Malaysian workers (full-time + freelancers/gig workers) and SME owners.
Stack: **Next.js 15 (App Router) + React 19 + TypeScript + MYDS (`@govtechmy/myds-react`) + Tailwind 3.4 + zod + Vitest**. AI runs on **YTL ILMU** (OpenAI-compatible, `https://api.ytlailabs.tech/v1`).

Competition: **ILMUcode: Jom Bina**. Build week is 1–7 Dec, **submissions due 8 Dec, 12pm** (live link + GitHub repo + 2-minute demo video + proof a real user used it).

---

## 1. Roles (who owns what)

| Role | Person | Responsible for |
| :--- | :--- | :--- |
| **Frontend** | **Huien** | All pages, UI components, styling, bilingual copy, frontend state, frontend code that calls the API, user experience |
| **Backend** | **Evan** | All API routes, statutory calculation engines, ILMU AI integration, prompts, legal/statutory data, tests, deployment/build scripts |

### 1.1 Files owned by Huien (Frontend)

```
src/app/**/page.tsx            # All pages: /, /workspace, /portals/*, /vision
src/app/layout.tsx
src/app/globals.css
src/components/**              # shell/, workspace/, portals/
src/lib/i18n/dictionary.ts     # EN / BM copy
src/lib/store/HakkuContext.tsx # Frontend global state (sessionStorage)
public/**                      # Logos, images, SVGs
tailwind.config.ts
postcss.config.mjs
```

### 1.2 Files owned by Evan (Backend)

```
src/app/api/**                 # /api/audit, /api/ilmu/{draft,rag,ocr,asr,tts,status}
src/lib/engines/payrollEngine.ts
src/lib/engines/gigEngine.ts
src/lib/engines/stampDutyEngine.ts
src/lib/ilmu/client.ts         # ILMU client + live/demo switching
src/lib/ilmu/demoEngine.ts     # Demo fallback when there is no API key
src/data/**                    # statutory-2026/rules.ts, demo-scenarios.ts
src/tests/**                   # Vitest
scripts/**                     # build-netlify-static.mjs
next.config.ts
.env.example
```

### 1.3 Shared files (tell the other person BEFORE changing ⚠️)

| File | Why it's shared | Rule |
| :--- | :--- | :--- |
| `src/lib/engines/types.ts` | **The frontend–backend data contract** (input/output types) | **Evan leads.** If Huien needs a new field → open an issue / message the group, Evan adds it. Only **add** fields; don't rename or delete existing ones casually |
| `src/lib/ilmu/browserBridge.ts` | The single entry point for frontend API calls (also handles static-export fallback) | **Huien leads**, but request/response shapes must match Evan's API routes |
| `package.json` / `package-lock.json` | Dependencies | Announce in the group before adding a package, to avoid lockfile conflicts |
| `README.md` / `EXPLAINER.md` / `AGENTS.md` | Docs | Whoever changes a feature updates the related section |

> **AI agent rule:** If you are helping Huien, **do not edit Evan's files**; if you are helping Evan, **do not edit Huien's files**. If you truly need to change the other person's file → stop and tell the human so they can coordinate.

---

## 2. Frontend–backend contract (API)

The frontend calls the API **only through `src/lib/ilmu/browserBridge.ts` (or one shared `fetch` helper)** — no scattered `fetch` calls inside components.
All request bodies are validated with **zod** on the backend; shared types live in `src/lib/engines/types.ts`.

| Endpoint | Method | Request (main fields) | Response (main fields) | Owner |
| :--- | :--- | :--- | :--- | :--- |
| `/api/audit` | POST | `{ kind: "payroll" \| "gig" \| "stamp", employees? \| gigCase? \| stampDuty? }` | `{ kind, audits }` or `{ kind, result }` | Evan |
| `/api/ilmu/draft` | POST | `{ mode?, locale, persona, draftKind, partyName, counterpartyName, findingsSummary[], totalAmountRm }` | `{ executionMode, modelUsed, title, body, fallbackNotice? }` | Evan |
| `/api/ilmu/rag` | POST | `{ mode?, locale, persona, query }` | Answer + cited statutory clauses | Evan |
| `/api/ilmu/ocr` | POST | `{ mode?, persona, documentType, imageBase64?, fileName?, maskPii }` | Extracted fields + `rawText?` | Evan |
| `/api/ilmu/asr` | POST | `{ mode?, persona, audioBase64?, scenarioId? }` | Transcribed text | Evan |
| `/api/ilmu/tts` | POST | `{ mode?, locale, text (2–1500 chars) }` | Audio / fallback notice | Evan |
| `/api/ilmu/status` | GET | – | `{ credentialsConfigured }` | Evan |

**Shared conventions:**
- `mode`: `"demo" | "live"`. Without `ILMU_API_KEY` the backend **automatically falls back to demo** and returns `fallbackNotice` — the frontend should show this notice, not treat it as an error.
- `locale`: `"en" | "bm"`; `persona`: `"freelancer" | "sme" | "worker"`.
- Error format: `{ error: string }` + HTTP 4xx/5xx. The frontend shows a friendly message on error — never a blank screen.
- **When adding / changing an endpoint:** Evan updates this table + `types.ts` first, then writes the route; Huien builds against the table.
- While the backend isn't ready, the frontend can use mock data from `demoEngine.ts` to build the UI — don't wait.

---

## 3. Definition of Done

### Huien — Frontend
- [ ] Works on small phone screens (≤ 400px) — most real users are on mobile
- [ ] Copy exists in both EN and BM (in `dictionary.ts`, not hardcoded in components)
- [ ] Readable in both Light and Dark mode
- [ ] Has loading, error, and empty states
- [ ] Uses MYDS components + MYDS tokens (`primary-600`, `txt-*`, `bg-*`, `otl-*`); no random new colours
- [ ] Money uses `tabular-nums`, formatted as `RM1,700.00`
- [ ] `npx tsc --noEmit` passes

### Evan — Backend
- [ ] **All RM amounts are calculated by the TypeScript engines — the LLM never calculates money** (the LLM only writes text / explanations)
- [ ] Every route validates input with zod; bad input returns 400
- [ ] If live mode fails → automatic fallback to demo, no crash
- [ ] Engine changes → add / update tests in `src/tests/engines.test.ts`; `npm test` passes
- [ ] `ILMU_API_KEY` is read only on the server, **never** with a `NEXT_PUBLIC_` prefix; never commit `.env.local`
- [ ] Prompts instruct the AI to: write only from the given findings and numbers, never invent laws, keep a polite and constructive tone, and include a disclaimer (not legal advice)
- [ ] `npx tsc --noEmit` + `npm test` + `npm run build` pass

---

## 4. Git workflow

```
main               ← always buildable and demo-ready
├── fe/<feature>   ← Huien's branches, e.g. fe/chat-ui, fe/mobile-layout
└── be/<feature>   ← Evan's branches, e.g. be/chat-endpoint, be/ilmu-live
```

1. Before starting: `git pull origin main`
2. Create your branch: `git checkout -b fe/xxx` or `be/xxx`
3. **Commit small and commit every day** (judges look at commits from 1–7 Dec)
4. Commit message format: `fe: add chat input box` / `be: add /api/chat endpoint` / `docs: update API table`
5. Push, open a PR → the other person takes a quick look → merge into `main`
6. Before merging, run locally: `npx tsc --noEmit && npm test && npm run build`

> **AI agent rule:** Do not push directly to `main`; do not `git push --force`; do not commit `node_modules/`, `.next/`, or `.env.local`.

---

## 5. Common commands

```bash
npm install
cp .env.example .env.local     # Fill in ILMU_API_KEY (only Evan needs a live key for testing)
npm run dev                    # http://localhost:3000
npx tsc --noEmit               # Type check
npm test                       # Vitest
npm run build                  # Production build
npm run build:netlify          # Generate the netlify-static/ static site
```

---

## 6. General rules for AI agents (important)

1. **Read this file first and confirm who you are helping (Huien = frontend / Evan = backend). Only edit that person's files.**
2. Tell the human before editing shared files (`types.ts`, `browserBridge.ts`, `package.json`).
3. No big architecture changes, no switching frameworks, no replacing the design system (keep MYDS).
4. Don't change dozens of files at once; one feature = one small change, easy to review and commit.
5. Money and legal figures → must come only from `src/lib/engines/` + `src/data/statutory-2026/`. If unsure about a regulation, leave a TODO for a human to confirm — **never make it up**.
6. All user-facing text must exist in both EN and BM.
7. After writing code, run `npx tsc --noEmit` (backend also runs `npm test`).
8. When the requirement is unclear, ask the human — don't guess.
