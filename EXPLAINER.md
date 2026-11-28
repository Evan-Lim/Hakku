
# Hakku — System, Law & Architecture Explainer

**Hakku** (*"Hak-ku"* — My Rights & Responsibilities) is Malaysia's Sovereign AI compliance companion designed for **freelance business owners, full-time SME business owners, and workers**.

It is built using the official **Malaysia Government Design System (MYDS)** (`@govtechmy/myds-react` & `@govtechmy/myds-style`), runs **deterministic 2026 Malaysian statutory math in TypeScript**, showcases **YTL ILMU multimodal AI**, and bridges users into **interactive official government portal mirrors** today while pitching direct **MyDigital ID + MyGDX** integration for production.

---

## 1. Strategic Evolution: Why Hakku Exists

Hakku synthesizes the strongest parts of three evaluated 2026 Malaysian civic-tech concepts into a single, constructive, high-TAM product:
1. **SME & Worker Payroll Statutory Shield** (RM1,700 basic minimum wage, Employment Act 1955 overtime, EPF Third Schedule + Oct 2025 mandatory 2% foreign-worker EPF, PERKESO *Lindung 24 Jam* SKBBK, and JTKSM *Working for Workers*).
2. **Freelance & Gig Workers Act 2025 (Act 872) Copilot** (written service agreements, 7-day invoice/payout benchmarks, 14-day suspension cap with 50% back-pay allowance, 1.25% PERKESO *Lindung Kendiri*, KWSP *i-Saraan* 20% matching, and Gig Workers Tribunal self-representation).
3. **2026 `e-Duti Setem` & PKPS Compliance Engine** (Item 4 employment contract RM3,000 threshold + Item 49(a) commercial/studio/staff-quarters leases without the abolished RM2,400 exemption + PKPS amnesty expiring December 31, 2026).

Instead of an adversarial "catch-someone" tool, Hakku positions every workflow constructively:
- **Workers** verify payslips in plain language and start with a polite HR clarification note before escalating to JTKSM WFW.
- **Freelance Business Owners & Gig Riders** protect written service terms, cashflow timelines, and social security.
- **Full-Time SME Business Owners** catch statutory gaps *before* payday, protecting staff and preventing unintentional RM10,000-per-employee penalties.

---

## 2. How the Deterministic Statutory Engines Work (Zero LLM Math)

LLMs never compute Ringgit figures in Hakku. All financial and legal calculations execute deterministically in pure TypeScript under `src/lib/engines/` and are covered by Vitest unit tests in `src/tests/engines.test.ts`.

### 2.1 Payroll & Statutory Engine (`src/lib/engines/payrollEngine.ts`)
- **Minimum Basic Wage Floor (RM1,700):** Verifies `basicSalaryRm >= 1700` *excluding* fixed allowances, commissions, or overtime.
- **Employment Act 1955 Overtime (`s.60A / s.60I`):**
  - $\text{ORP} = \text{Basic Salary} / 26$
  - $\text{HRP} = \text{ORP} / \text{Normal Daily Hours}$ (capped at 8 hours/day)
  - Multipliers: `1.5x` normal overtime, `2.0x` rest-day overtime, `3.0x` public-holiday overtime.
- **EPF / KWSP (`Third Schedule`):**
  - *Malaysian Citizens / PRs (< 60):* Fixed RM20 wage brackets up to RM5,000 (`11%` employee, `13%` employer) and RM100 brackets from RM5,000.01–RM20,000 (`11%` employee, `12%` employer), rounded up to the next RM1.
  - *Malaysian Citizens (>= 60):* Part E (`0%` mandatory employee, `4%` employer).
  - *Foreign Workers (Oct 2025 Mandate, Part F):* Mandatory **`2%` employee + `2%` employer** calculated on actual monthly wages ($\ge \text{RM1,700}$ floor), each share rounded up independently to the next whole ringgit (e.g., $\text{RM1,751} \times 2\% = \text{RM35.02} \rightarrow \text{RM36}$).
- **PERKESO (SOCSO) & EIS (`RM6,000 Ceiling`):**
  - RM100 midpoint bracket tables (`1.75%` employer / `0.5%` employee Category 1 SOCSO; `0.2%` each EIS for citizens under 60; Category 2 `1.25%` employer injury-only for foreign workers / age 60+). Maximum ceiling at RM5,900.01–RM6,000+: SOCSO ER `RM104.15`, EE `RM29.75`; EIS ER/EE `RM11.90`.
- **PERKESO *Lindung 24 Jam* / SKBBK (July 2026):**
  - Phase 1 rate of **`0.75%`** (employee-borne, capped at RM6,000 ceiling -> max `RM45.00/mo`).
  - **Mandatory** for documented foreign workers; **optional (opt-out permitted)** for Malaysian citizens. Flags improper deductions if a citizen opted out.

### 2.2 Freelance & Gig Act 872 Engine (`src/lib/engines/gigEngine.ts`)
- **Written Service Agreement Score:** Audits whether a SOW/platform agreement covers written form, transparent fee formula, payout timeline, and fair suspension/review procedure.
- **7-Day Payout Benchmark:** Flags invoices/payouts open beyond 7 days from work completion.
- **14-Day Suspension Cap & 50% Back-Pay Shield:** Flags platform suspensions exceeding 14 days without resolution and calculates mandatory **`50%` average daily earnings** inquiry allowance across suspension days.
- **Safety Net Planner:** Computes **`1.25%` PERKESO *Lindung Kendiri* (SKSPS)** and tracks **KWSP *i-Saraan* `20%` government matching** headroom.

### 2.3 2026 `e-Duti Setem` Engine (`src/lib/engines/stampDutyEngine.ts`)
- **Employment Contracts (Stamp Act 1949, First Schedule Item 4 — effective Jan 1, 2026):**
  - Monthly remuneration $\le \text{RM3,000}$: **Exempt (`RM0`)**.
  - Monthly remuneration $> \text{RM3,000}$: **`RM10`** flat principal duty (`+ RM10` per duplicate copy). Supplementary/subsidiary operational letters are flagged as exempt from duplicate stamping.
- **Commercial / Studio / Staff-Quarters Tenancy (Item 49(a), 2026 Rules):**
  - Former RM2,400 exemption abolished — duty applies to **full annual rent** per **RM250 block (or part thereof)**: `RM1` ($\le 1$ yr), `RM3` ($>1$–$3$ yrs), `RM5` ($>3$–$5$ yrs), `RM7` ($>5$ yrs/indefinite), `+ RM10` per duplicate copy.
- **30-Day Window & PKPS Amnesty:** Tracks the 30-day execution stamping deadline and highlights **PKPS Stamp Duty Special Voluntary Disclosure** eligibility (penalty-free regularization before **December 31, 2026**).

---

## 3. YTL ILMU Sovereign AI & Toggleable Execution Modes

Hakku integrates five YTL ILMU model roles (`src/app/api/ilmu/*` + `src/lib/ilmu/demoEngine.ts`):
- **`ilmu-vision-v1.3`**: Extracts line items from payslips, gig screenshots, contracts, and tenancy PDFs/images, with an onshore PII/NRIC masking toggle (`97xxxx-xx-5128`).
- **`ilmu-asr-v4.2`**: Transcribes Bahasa Melayu, English, and Manglish voice notes into structured context.
- **`bge-m3`**: Ranks relevant 2026 Malaysian statutory clauses for cited RAG Q&A.
- **`ilmu-v3.1`**: Composes smooth, constructive bilingual (EN/BM) HR clarification notes, client reminders, SME staff advisories, WFW summaries, and Gig Tribunal dossiers using verified deterministic numbers.
- **`ilmu-tts-v2`**: Reads audit summaries aloud (with native browser `speechSynthesis` `ms-MY`/`en-MY` fallback in Sovereign Demo / Static modes).

### Mode Toggle (Live API vs Sovereign Demo / Static Fallback)
- **Full-Stack Next.js Server (`npm run dev` / `npm run start`):** Reads `ILMU_API_KEY` from `.env.local` on the server side (`src/lib/ilmu/client.ts`). When the navbar toggle is set to `ILMU: Live API` and credentials exist, live requests go straight to `https://api.ytlailabs.tech/v1`; otherwise Hakku falls back smoothly to `demoEngine.ts`.
- **Static Netlify Drop (`netlify-static/`):** Built via `npm run build:netlify` with `NEXT_PUBLIC_STATIC_EXPORT=true`. The client bridge (`src/lib/ilmu/browserBridge.ts`) routes all AI interactions cleanly through in-browser Sovereign Sandbox handlers (`demoEngine.ts`) and browser Web Speech synthesis—retaining 100% of interactive features with zero 404 errors.

---

## 4. Official Government Portal Mirrors vs. Production Pitch

### What the Prototype Ships (`/portals/*` & `MyDigitalIdModal`)
- **MyDigital ID SSO Simulator:** Click **Connect MyDigital ID (Sandbox)** to approve a simulated push/QR handshake and populate verified mock JPN/LHDN/SSM claims (`nama`, masked `nric`, `tin`, `ssmNo`) persisted across routes via `sessionStorage`.
- **5 Interactive Portal Mirrors (clearly badged `PROTOTYPE PORTAL MIRROR`):**
  1. `/portals/perkeso` — **PERKESO ASSIST & Lindung** (`Borang 8A` SME schedule + *Lindung 24 Jam* + *Lindung Kendiri* 1.25%).
  2. `/portals/kwsp` — **KWSP i-Akaun & i-Saraan** (`Borang A` Third Schedule + 2% foreign EPF, *i-Saraan* 20% match, worker verification).
  3. `/portals/kesuma` — **JTKSM Working for Workers (WFW) & Gig Workers Tribunal (Act 872)** e-Filing.
  4. `/portals/mytax` — **LHDN MyTax `e-Duti Setem` & SSM BizTrust** (Item 4 / Item 49(a) / PKPS assessment + printable Prototype *Sijil Setem*).

### Production Pitch (`/vision`)
In commercial and B2G deployment, Hakku replaces the sandbox mirrors with:
1. **Live MyDigital ID OIDC / PKCE Single Sign-On** for passwordless citizen & business authentication.
2. **YTL AI Cloud Onshore Hosting** for strict Malaysian data residency under PDPA.
3. **MyGDX (Malaysian Government Central Data Exchange)** & official agency APIs for consented 2-way reads and pre-validated submissions directly into `.gov.my` systems.

---

## 5. MYDS UI/UX Design Compliance (`design.digital.gov.my/en`)

- Built with `@govtechmy/myds-react` (`Masthead`, `Navbar`, `AnnounceBar`, `Footer`, `Skiplink`, `Tabs`, `Select`, `Input`, `TextArea`, `Checkbox`, `Button`, `Tag`, `Callout`, `CalloutAction`, `SummaryList`, `Table`, `Dialog`, `Breadcrumb`, `ThemeSwitch`, `Spinner`).
- Uses MYDS typography (**Poppins** headings + **Inter** body with `tabular-nums` for Ringgit amounts), semantic color tokens (`primary-600 #2563EB`, `success`, `warning`, `danger`, `otl-*`, `bg-*`, `txt-*`), Light & Dark modes, and the responsive **12-8-4 grid system**.
- Enforces visual trust boundaries: the main product uses `AnnounceBar` + Hakku branding, while MYDS `Masthead` is reserved for `/portals/*` alongside a persistent amber `PROTOTYPE PORTAL MIRROR` notice.
