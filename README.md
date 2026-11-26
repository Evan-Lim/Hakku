# Hakku

**Hakku** is a Malaysian Sovereign AI work, freelance, and SME compliance hub built on the **Malaysia Government Design System (MYDS)** (`@govtechmy/myds-react` & `@govtechmy/myds-style`). It unifies deterministic 2026 Malaysian statutory checks, **YTL ILMU** multimodal AI (`Demo` & `Live API` toggleable), and interactive **MyDigital ID + Official Government Portal Mirrors** ready for both full-stack Node hosting and drag-and-drop **Netlify static hosting** (`netlify-static/`).

> Deep dive on statutory math, YTL ILMU architecture, and the MyDigital ID pitch: see [EXPLAINER.md](./EXPLAINER.md).

---

## Target Personas & Core Capabilities

| Persona | Core Capabilities |
| :--- | :--- |
| **Freelance Business Owners & Gig Workers** | Gig Workers Act 2025 (Act 872) written SOW checklist, 7-day invoice/payout tracking, 14-day suspension cap & 50% back-pay calculation, 1.25% PERKESO *Lindung Kendiri* (SKSPS), KWSP *i-Saraan* 20% match tracking, and studio/workspace `e-Duti Setem`. |
| **Full-Time Business Owners (SME Employers)** | Pre-payday shield across local & foreign workers: RM1,700 basic wage floor, EA 1955 overtime (`1.5x/2.0x/3.0x`), EPF Third Schedule + Oct 2025 mandatory 2% foreign-worker EPF, PERKESO + *Lindung 24 Jam* (`0.75%`), Item 4 employment contract stamping, and Item 49(a) shop-lot/staff-quarters leases + PKPS amnesty (until 31 Dec 2026). |
| **Full-Time & Contract Workers** | Plain-language payslip verification (`ORP`/`HRP` math, allowance vs basic check, *Lindung 24 Jam* opt-out validation), polite EN/BM HR clarification notes, and JTKSM *Working for Workers (WFW)* submission preparation. |

---

## Official Portal Mirrors & Production Vision

- **Interactive Prototype Mirrors (`/portals/*`):**
  - **MyDigital ID SSO Modal** (simulated OIDC/PKCE claims persisted across navigation via `sessionStorage`)
  - **PERKESO ASSIST & Lindung** (`/portals/perkeso`)
  - **KWSP i-Akaun & i-Saraan** (`/portals/kwsp`)
  - **JTKSM Working for Workers (WFW) & Act 872 Gig Tribunal** (`/portals/kesuma`)
  - **LHDN MyTax `e-Duti Setem` & SSM BizTrust** (`/portals/mytax`)
- **Production Vision (`/vision`):** Architecture & business-model roadmap connecting live **MyDigital ID** and **MyGDX** rails directly to official Malaysian government apps.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript) + React 19
- **UI & Design System:** `@govtechmy/myds-react`, `@govtechmy/myds-style`, Tailwind CSS 3.4, `lucide-react`
- **AI Integration:** OpenAI-compatible YTL ILMU client (`ilmu-v3.1`, `ilmu-vision-v1.3`, `ilmu-asr-v4.2`, `ilmu-tts-v2`, `bge-m3`) + `zod` schema validation + Sovereign Sandbox browser/server fallback
- **Testing:** Vitest (`src/tests/engines.test.ts`)

---

## Quick Start

### 1. Local Full-Stack Development (Next.js Server + Optional Live ILMU Key)
```bash
npm install
cp .env.example .env.local   # Optional: set ILMU_API_KEY to enable Live YTL ILMU endpoints
npm run dev
```
Open `http://localhost:3000`. Use the **ILMU: Demo / Live API** toggle in the navbar to switch modes anytime; if `ILMU_API_KEY` is blank, Live requests fall back gracefully to Sovereign Demo Mode.

### 2. Verification & Production Build
```bash
npx tsc --noEmit
npm test
npm run build
npm run start
```

### 3. Static Site Export for Netlify Drop (`netlify-static/`)
To generate or refresh the self-contained static folder (`netlify-static/`) that retains all interactive calculators, demo cases, multimodal sandbox flows, bilingual EN/BM switching, Light/Dark themes, MyDigital ID modal, and all 5 official portal mirrors:

```bash
npm run build:netlify
```

**Deploying to Netlify:**
1. Open [app.netlify.com/drop](https://app.netlify.com/drop) (or your Netlify Sites dashboard).
2. Drag and drop the **`netlify-static`** folder directly onto the page.
3. All routes (`/`, `/workspace/`, `/portals/`, `/portals/perkeso/`, `/portals/kwsp/`, `/portals/kesuma/`, `/portals/mytax/`, `/vision/`) and `_redirects` rules are pre-bundled and ready to serve as a static site.

---

## Project Structure

```text
Hakku/
├── EXPLAINER.md                 # Detailed system, 2026 statutory math & architecture guide
├── README.md                    # Project overview, setup & deployment guide
├── netlify-static/              # Ready-to-drag-and-drop static Netlify site bundle
├── scripts/
│   └── build-netlify-static.mjs # Builds static export safely into netlify-static/
├── public/                      # Hakku & MyDigital ID SVG assets
└── src/
    ├── app/                     # Next.js routes (/, /workspace, /portals/*, /vision, /api/*)
    ├── components/              # MYDS AppShell, MyDigitalIdModal, Workspace & PortalMirrorShell
    ├── data/                    # 2026 statutory corpus & 4 one-click demo scenarios
    ├── lib/
    │   ├── engines/             # Pure TS engines: payrollEngine, gigEngine, stampDutyEngine
    │   ├── ilmu/                # Server ILMU client, shared demoEngine & static-safe browserBridge
    │   ├── i18n/                # Bilingual EN / BM dictionary
    │   └── store/               # HakkuContext with sessionStorage persistence
    └── tests/                   # Vitest statutory math verification suite
```
