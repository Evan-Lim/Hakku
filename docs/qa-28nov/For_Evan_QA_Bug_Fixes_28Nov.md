# Hakku QA Bug-Fix List for Evan (Backend, Parsing & Legal Math)

The QA run below was reported on commit `8eec5cd`. Use the [reviewed Step 5 examples](Hakku_Step5_and_Messages_Reviewed.md) for the corrected amounts, case inputs and follow-up conditions.

**Branch Tested:** `be/agent-autofile` (commit `8eec5cd`)  
**Prepared by:** Research & QA Teammate · **Date:** 28 November 2026  
**Your Scope (`AGENTS.md`):** `src/lib/agent/**`, `src/lib/engines/**`, `src/lib/ilmu/**`, `src/app/api/**`, `src/data/**`, `src/tests/**`, `package.json`

### Automated Test Snapshot
- `npx tsc --noEmit`: **PASS** (`0` errors)
- `npm test`: **PASS** (`3` files, `22/22` tests passing)
- `next build`: **Compiles `22` pages cleanly**, but `npm run build` **fails on Windows** (POSIX env syntax in `package.json`)
- **50-Case `/api/agent` Stress Test:** **`31` clean pass / `19` failed or flagged** (`0` HTTP 500 crashes, `46.8 ms` avg latency)

---

## P0 — Critical Bugs (Fix First: Wrong Money or Broken Core Flows)

### 1. Negative Numbers Silently Flipped into Positive Owed Amounts (`understand.ts`, `runAgent.ts`)
- **Repro Input:** `"My salary is RM-500 and RM0 OT for -3 hours"` (and entering `-500` in the `basicSalaryRm` follow-up input).
- **What Happened:** Parser stripped `-` and extracted `otHours: 3`, then accepted `-500` as `+500`, calculating **`RM1,236.77` total owed** (`RM1,200` min-wage shortfall + `RM36.77` OT).
- **Proposed Fix:** Reject negative inputs (`< 0`) cleanly with a clear validation error/prompt across `understand.ts`, `zod` schemas, and numeric clarification answers.

### 2. Gig Rider Overdue Payouts Dropped from Calculation (`understand.ts`, `runAgent.ts`, `handoff.ts`)
- **Repro Inputs:**
  - `GIG-01`: `"Akaun Grab saya kena suspend 19 hari tak ada keputusan, payout RM640 sangkut 11 hari"` (daily = `100`) → Extracted `pendingPayoutRm: 640`, **but returned `totalRm: 950`** (dropped `RM640`), and left `[nama platform]` blank in `/lapor` instead of `"Grab"`.
  - `GIG-04`: `"Grab hasn't paid my RM450 earnings from 10 days ago"` → Extracted `daysSinceWorkCompleted: 10`, dropped `pendingPayoutRm: 450`, returned **`totalRm: 0`**.
  - Rider prompt `"Grab rider ID GR-9912 suspended 19 days, RM640 payout ref PAY-8821 stuck 11 days, RM100/day"` still paused to ask `"What were your average daily earnings?"` despite `"RM100/day"` in text.
- **Proposed Fix:** Extract `pendingPayoutRm`, `averageDailyEarningsRm` (`RM.../day`), and platform name (`Grab`, `Foodpanda`, `Lalamove`, `ShopeeFood`) without collisions; show the verified unpaid payout and any conditional suspension estimate separately, with only the verified payable amount in the amount-due total; pass extracted platform name cleanly to `/lapor`.

### 3. 5-Day Rider Suspension Falsely Says *"Nothing Looks Underpaid"* (`runAgent.ts`)
- **Repro Input:** `"My Lalamove rider account was suspended for 5 days with no answer, average RM90/day"`
- **What Happened:** Returned `totalRm: 0`, `findings: []`, zero Act 872 citation, and `"Good news: from what you told us, nothing looks underpaid."`
- **Proposed Fix (Official Act 872 `s.14`):** A suspension `≤14` days is within the 14-day inquiry limit—but if **no valid grounds** are found upon review, **50% back-pay (`5 × RM45 = RM225`)** still applies (`Likely, needs outcome`). Never tell an actively suspended rider *"nothing looks underpaid"*.

### 4. Agreed `Net 30` Contract Flagged as Overdue at Day 12 (`runAgent.ts`)
- **Repro Input:** `"Client owes me RM1500 for videography, delivered 12 days ago, contract says Net 30 days payment term"`
- **What Happened:** Parser correctly set `hasPaymentTerm: true`, yet the engine **still** computed `totalRm: 1500` as overdue past the 7-day statutory default!
- **Proposed Fix (Act 872 `s.11(1)`):** Only trigger the 7-day overdue rule when `!hasPaymentTerm` (agreement has no payment terms). When `hasPaymentTerm` is true, extract `contractPaymentDays` (e.g., `30`) or ask the user for the agreed due date before flagging late pay.

### 5. Drafts Drop Recipient Identifiers & Falsely Claim *"Attached"* (`report.ts`, `handoff.ts`, `understand.ts`)
- **What Happened:**
  - **Employee:** Dropped **`SM-042`**, **`Subang Jaya`**, and **`November 2026`** from generated drafts.
  - **Gig Rider:** Dropped **`GR-9912`**, **`PAY-8821`**, **`Grab`** from the body (`[nama platform]`), and `11 days` payout details.
  - **Freelancer:** Dropped **`Lensa Korporat Sdn Bhd`** (`[nama klien]`), **`INV-2026-088`**, and **`agreed due date 7 days`**.
  - **False Attachment Claim:** Every `/tanya` draft ends with `"4. Bersama-sama ini saya lampirkan dokumen sokongan seperti yang disenaraikan"` even though `mailto:` / Gmail compose links and WhatsApp copy-paste attach **no files**.
- **Proposed Fix:** Extract/preserve identifying fields (`employeeId`, `branch`, `payPeriod`, `counterpartyName`, `riderId`, `referenceNo`, `dueDate`) in drafts, and update paragraph 4 wording to instruct manual attachment (e.g. *"Saya akan kongsikan dokumen sokongan berikut..."*).

---

## P1 — Parsing, Routing & Legal Accuracy Bugs

### 6. Regex / Number Collisions in `understand.ts`
- **Allowance misread (`EMP-01`):** `"RM1650 plus RM250 allowance, worked 16 hours OT"` → `fixedAllowanceRm: 16` instead of `250`.
- **Salary misread (`EMP-08`):** `"lorry driver earning RM4200 basic, worked 12 hours OT unpaid"` → **`basicSalaryRm: 12`** instead of `4200`.
- **`Lindung 24 Jam` double bug (`EMP-04`):** `"deducted RM15.40 for Lindung 24 Jam even though I already opted out"` → **`lindungDeductedRm: 24`** (grabbed `"24"` from *"24 Jam"*) AND inverted **`optedOutLindung: false`**, returning *"nothing looks underpaid"*!
- **BM/Simple `"RM0"` misses:** `"Gaji asas saya RM1500, buat OT 20 jam tapi bos bayar RM0"` (`EMP-05`) left `otPaidRm: undefined` and `totalRm: 0` (even though `RM1,500` already breaches `RM1,700` min wage!). `"RM1400 salary and never deducts EPF"` (`EMP-07`) extracted `{}`.
- **Multilingual extractions:** Chinese `"我的Grab账号被停了20天，还有RM500没给"` dropped `RM500`; Tamil `"என் சம்பளம் RM1500, OT 10 மணி நேரம் கொடுக்கவில்லை"` dropped `RM1500` and `"unpaid"`.

### 7. Persona Misclassifications (`understand.ts`)
- Platform graphic designer (`FRL-08`: `"graphic design job on a Malaysian gig platform 18 days ago, RM1200 still unpaid"`) → `caseType: null`.
- SME employer queries (`SME-02` foreign worker EPF/SOCSO & `SME-06` `"Saya pemilik kedai kopi..."`) → misclassified as **`employee`** instead of **`sme`**.
- Stamp duty Item 4 questions (`SME-04`, `SME-05`) → `caseType: null`.

### 8. Employee `>RM4,000` OT Cap & Rest Day / Public Holiday Rates (`runAgent.ts`, `payrollEngine.ts`)
- **`>RM4,000` OT Cap (`EMP-02`):** `RM4,500` salary + `10h` OT calculated `RM324.60 Confirmed` with **zero warning** that statutory OT cuts off above `RM4,000/mo` (except `First Schedule Para 2` manual workers/commercial drivers).
- **Rest Day & PH (`EMP-03`):** Dropped rest day / PH hours and calculated flat **`1.5×`** instead of EA `s.60(3)` (`0.5/1.0` ORP normal + `2.0×` OT beyond normal) and `s.60D(3)` (`2.0` days ORP normal + `3.0×` OT beyond normal).

### 9. Freelancer Act 872 Coverage & Dispute Escalation (`runAgent.ts`, `gigEngine.ts`)
- **Non-Scheduled Direct Clients (`FRL-02`, `FRL-03`):** Direct private tutor (`RM3,000`) and direct software developer (`RM4,200`) were wrongly given **Act 872 + JTKSM e-Aduan Gig** instead of **Small Claims `Order 93 Form 198`** (`≤RM5,000`; sole proprietors CAN file).
- **Act 872 Escalation (`s.17–19`):** Still skips conditional 30-day internal resolution check (bypassed for sole proprietors / no mechanism / `s.14` deactivation) → **60-day JPPM Conciliation** → Tribunal referral. *(Also apply `Borang PS 2` instead of `Borang 34` for SKSPS rider injuries, and `i-Saraan Plus` `RM600/yr` cap for platform riders.)*

### 10. Part-Time & `"Disguised Freelancer"` Polish (`runAgent.ts`, `partTimeEngine.ts`)
- **Wrong BM Report Subject (`PT-03`):** User earning `RM9.50/hr` (≥ `RM8.72/hr`) with missing EPF/SOCSO still receives Subject `"Aduan Kadar Gaji Sejam di Bawah Kadar Minimum (Perintah Gaji Minimum 2024)"` and `"terhutang ialah RM0.00"` (plus routes to JTKSM instead of KWSP/PERKESO or citing Act 4 SOCSO).
- **Hardcoded `'freelance'` text (`PT-02`..`PT-04`):** Regular retail/tuition workers see `"even though the job is called 'freelance'"` even when they never mentioned freelance.
- **Casual `<30%` hours (`PT-02`):** `10 hrs/wk` is handled identically to `20–25 hrs/wk` (`>30%–70%` Part-Time Regs 2010).
- **Missing EPF estimate:** When hours × hourly rate are known (e.g. `RM950/mo`), optionally display estimated missed employer EPF (`13%`) cleanly.

### 11. SME Pre-Payday, Stamp Duty & PII-Masking Fixes (`payrollEngine.ts`, `stampDutyEngine.ts`, `demoEngine.ts`, `rules.ts`)
- **Foreign Worker SOCSO (`payrollEngine.ts`):** Still uses old **Category 2 (`1.25% ER / 0% EE`)** instead of **Category 1 (`1.75% ER / 0.50% EE`, effective 1 July 2024 for `<55` first reg) + `0.75%` `Lindung 24 Jam` (effective 1 June 2026) = `3.00%` combined**. (Update `rules.ts` effective date from `July 2026` to **1 June 2026**, enforce SKBBK on Cat 2 too, and enforce the `31 Aug 2026` opt-out cutoff.)
- **2026 Lease PKPS Amnesty (`stampDutyEngine.ts`):** Still flags a late 2026 lease signed 45 days ago as PKPS penalty-free (`2023–2025` instruments only; 2026 gets `s.47A` two-tier penalty). Also apply **Item 4** `≤RM3,000` check on gross pay including fixed allowances, and **Item 34** duplicate copy cap (`min(originalDuty, 10)`).
- **Broken `[REDACTED]` Token & SME Resolution Steps (`demoEngine.ts`):** SME memo outputs **`"RM1,700 [REDACTED] floor"`**, gives **no steps** for how to verify the 2% calculation, fix `KWSP Borang A` before payday, or explain the deduction to Budi Santoso.
- **Unexplained `RM1.00` Variance (`payrollEngine.ts` / preset):** Aina preset shows `RM129.48` variance while itemized EE lines sum to `RM128.48` (`50 + 56.08 + 7 + 15.40`).

### 12. Real OCR vs. Demo Transparency (`/api/ilmu/ocr`)
- Uploading a real payslip (`sample_payslip.png` on `/workspace`) returned hardcoded `worker-aina` / `freelancer-hafiz` fixture fields while labeling itself `"ilmu-vision-v1.3 (Sovereign Sandbox)"`. Wire real `ilmu-vision-v1.3` parsing when live `ILMU_API_KEY` is configured and clearly warn in demo mode that a sample fixture was loaded rather than reading the uploaded PNG.

### 13. Windows Build Script (`package.json`) & Regression Tests (`src/tests/`)
- Replace `"build": "NODE_OPTIONS=\"--dns-result-order=ipv4first\" next build"` with `cross-env` so `npm run build` succeeds on Windows too.
- Add regression tests in `src/tests/agent.test.ts` and `src/tests/engines.test.ts` covering negative numbers, `EMP-01/02/03/04/08`, `GIG-01/02/04`, `FRL-02/04/08`, `SME-02/03`, and Chinese/Tamil extractions.
