# Hakku Backend & Statutory Engine Review — Handoff for Evan

**Recipient:** Evan (Backend Owner per `AGENTS.md`: `src/app/api/**`, `src/lib/engines/**`, `src/data/**`, `src/lib/ilmu/**`, `src/tests/**`)  
**Prepared by:** Research Teammate  
**Verified Date:** 27 November 2026  
**Primary Sources Checked:** KESUMA Act 872 83-page FAQ & 49-page slides, PERKESO *LINDUNG 24 Jam* (SKBBK) FAQ v2.3 & live portal page, AGC/JTKSM *Employment Act 1955* reprint PDF, LHDN STAMPS closure notice & *PKPS Duti Setem 2026* clarifications, and live HTTP checks across all `.gov.my` links.

> **Branching & Coordination Reminder (`AGENTS.md`):**
> - Do this work on a `be/<feature>` branch (never push directly to `main`).
> - Coordinate any new/expanded fields in `src/lib/engines/types.ts` with Huien before merging.
> - Also note Jom Bina compliance: the hackathon build window is **1–7 Dec** (with existing `26 Nov` commits on the current repo—double-check team repo strategy before Dec 1).

---

## Priority 1 — Must-Fix Before Demo (8 High-Impact Items)

### 1. PKPS Stamp Duty Amnesty Date Window (`src/lib/engines/stampDutyEngine.ts`, `src/data/demo-scenarios.ts`)
- **Finding:** `stampDutyEngine.ts` currently sets `pkpsAmnestyEligible = isPast30DayWindow && !input.alreadyStamped`, which automatically flags *any* document signed more than 30 days ago—including `Encik Razak`'s shop lease signed 45 days ago in late 2026—as penalty-free under PKPS.
- **Verification:** LHDN's *PKPS Duti Setem 2026* (extended to **31 Dec 2026**) waives `s.47A(2)` late penalties **only** for unstamped chargeable instruments executed between **1 January 2023 and 31 December 2025**. Instruments executed in **2026** do **not** qualify and incur Finance Act 2024 two-tier `s.47A` penalties (`RM50` or `10%` of deficient duty if `≤3` months late; `RM100` or `20%` if `>3` months late).
- **Proposed Solution:**
  1. Add `executionDate?: string` (`YYYY-MM-DD`) to `StampDutyInput` in `types.ts`.
  2. Restrict `pkpsAmnestyEligible` strictly to instruments executed within `2023-01-01` to `2025-12-31`.
  3. For late `2026` instruments, compute and display the applicable `s.47A` two-tier penalty instead of the PKPS waiver.
  4. Update `Encik Razak`'s scenario in `src/data/demo-scenarios.ts` (either move lease execution date into `2025` if demonstrating PKPS, or keep late `2026` and display the `s.47A` penalty).

---

### 2. Stamp Act Item 4 Allowances & Item 34 Duplicate Copies (`src/lib/engines/stampDutyEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:** Item 4 (`≤RM3,000/month`) exemption logic is currently tested against basic pay alone rather than gross remuneration, and duplicate copy duty (`RM10`) does not reflect the `Item 34` rule.
- **Verification:**
  - Per LHDN's **7 Aug 2026** clarification, employment contracts at or below **RM3,000/month** are fully exempt and need **no stamping, submission, or endorsement**. However, under LHDN's 2026 guidance, the `RM3,000` test **includes fixed allowances** (gross monthly remuneration—unlike Minimum Wages Order basic pay).
  - Instruments signed in Malaysia must be stamped within **30 days** of execution (instruments executed **outside Malaysia** have 30 days from **receipt in Malaysia**).
  - Duplicate/extra copies are governed by **First Schedule, `Item 34`** (not `s.12`, which covers denoting duty): if the original duty is `≤RM10`, each duplicate copy duty equals the **same amount as the original**; otherwise it is capped at **`RM10`**, with `s.12` requiring the original to be duly stamped first.
- **Proposed Solution:**
  1. Evaluate Item 4 using **gross monthly remuneration** (`basicSalary + fixedAllowances`).
  2. Add an `executedAbroad?: boolean` helper/note clarifying the 30-day clock starts upon receipt in Malaysia.
  3. Compute duplicate duty as `Math.min(principalDutyRm, 10)` per copy (when `principalDutyRm > 0`) and cite **First Schedule, `Item 34`**.

---

### 3. Foreign Worker SOCSO + `Lindung 24 Jam` / SKBBK Rules (`src/lib/engines/payrollEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:**
  1. `calculateSocsoAndEis` currently groups all `foreign` workers together with `60_plus` under **Category 2** (`1.25%` employer, `0%` employee).
  2. `rules.ts` cites `"Lindung 24 Jam (July 2026)"` instead of **1 June 2026**.
  3. The engine does not enforce SKBBK on Category 2 contributors, track the **31 Aug 2026** local opt-out cutoff, or handle new first-time local hires after 31 Aug 2026.
- **Verification (PERKESO FAQ v2.3, Act A1788 & Live Portal Page):**
  - **Foreign Worker Base SOCSO (since 1 July 2024):** Foreign workers first registered under age **55** fall under **Category 1** (`1.75%` employer / `0.50%` employee; EIS still exempt). Only `55+` (first entry) / `60+` are Category 2 (`1.25%` employer / `0%` base SOCSO employee).
  - **`Lindung 24 Jam` (SKBBK, effective 1 June 2026):** Employee-borne Phase 1 rate is **0.75%** (`0%` employer) up to the `RM6,000` ceiling (rises to `1.00%` Jun 2028–May 2031, `1.25%` from Jun 2031).
  - **Applies to BOTH Cat 1 and Cat 2 (no upper age limit):** Category 2 is **no longer `0%` employee** unless a local worker validly opted out! Official `>RM6,000` ceiling totals with SKBBK:
    - **Cat 1:** Employer `RM104.15` + Employee `RM74.40` (`RM29.75` SOCSO + `RM44.65` SKBBK) = **`RM178.55`**
    - **Cat 2:** Employer `RM74.40` + Employee `RM44.65` = **`RM119.05`**
  - **Combined 2026 Cat 1 Foreign Worker Rates:** Employer `1.75%` (`1.25%` Injury + `0.50%` Invalidity) + Employee `1.25%` (`0.50%` Invalidity + `0.75%` SKBBK mandatory, no opt-out) = **`3.00%`** total (computed using the **official June 2026 PERKESO wage-band table**, not plain `% × salary`).
  - **Local Opt-Out & New Hires Cutoff:** Cabinet made SKBBK voluntary for locals w.e.f. **8 Jul 2026**, **June 2026 was mandatory and non-refundable for everyone**, and the opt-out window closed **31 Aug 2026**. Verified verbatim on PERKESO's live portal (27 Nov 2026): *"Local employees hired for the first time after 31 August 2026 are also required to contribute under the SKBBK"* (mandatory from Month 1; opted-out locals can opt back in anytime without backdating).
- **Proposed Solution:**
  1. Separate `foreign` from `60_plus` in `calculateSocsoAndEis` using `firstRegisteredAge < 55` for Cat 1 foreign SOCSO (`1.75%` ER / `0.50%` EE).
  2. Apply `calculateLindung24Jam` to both **Cat 1 and Cat 2** (no upper age exemption).
  3. Add flags for `optedOutBefore31Aug2026` and `firstTimeLocalHireAfter31Aug2026` (rejecting citizen opt-out claims for June 2026 or post-Aug-2026 first-time hires).
  4. Update `rules.ts` effective date to **1 June 2026** and adopt official June 2026 PERKESO Act 4 + SKBBK wage-band lookup values.

---

### 4. Employment Act 1955 Rest Day / PH Pay, Manual Workers & Part-Time Regs (`src/lib/engines/payrollEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:** `auditEmployeePayroll` currently multiplies all `restDayHours` by a flat `2.0× HRP` and all `publicHolidayHours` by a flat `3.0× HRP`, omits the manual-worker exception to the `RM4,000` OT cap, and lacks a **Part-Time Employees Regulations 2010** (`RM8.72/hr`) audit path.
- **Verification:**
  - **Rest Day (`s.60(3)(b)–(c)`):** Within normal daily hours (monthly-rated), pay is **0.5 day ORP** (`≤½` normal hours) or **1.0 day ORP** (`>½` normal hours). **`2.0× HRP` applies ONLY to OT hours beyond normal daily hours**.
  - **Paid Public Holiday (`s.60D(3)(a), (aa)`):** Within normal daily hours, pay is **2 full days' ORP** (+ holiday pay) **even if work done is less than normal hours** (e.g., 1 hour). **`3.0× HRP` applies ONLY to OT hours beyond normal daily hours**.
  - **ORP & HRP base (`s.60I`):** Based on `s.2` `"wages"` (not strictly basic salary alone), normal daily hours max `8h/day` and `45h/week` (`s.60A(1)`), except proviso (iii) allows up to `9h/day` (max `45h/week`) by agreement on a 5-day / short-day week.
  - **`RM4,000` Salary Cap Exception (`First Schedule, Para 2`):** Manual labourers (`>50%` manual work), their supervisors, and commercial vehicle drivers/maintainers/vessel crew keep statutory OT **regardless of salary**.
  - **`s.101C` Scope & East Malaysia Parity:** `s.101C` is statutorily scoped to **JTKSM offence proceedings** in the absence of a written contract (not automatically civil Labour/Industrial Court claims). **Sabah** (*Cap. 67*) and **Sarawak** (*Cap. 76*) enacted harmonised Ordinances effective **1 May 2025**.
  - **Part-Time Regs 2010 (`P.U.(A) 303/2010`):** Covers `>30%` to `≤70%` of comparable full-time weekly hours; **`RM8.72/hr`** minimum floor; `≥7` paid PHs/year (**4 compulsory**: National Day, Agong's Birthday, State Ruler/YDPN/FT Day, Workers' Day—Malaysia Day is not compulsory); Annual Leave `6/8/11` days & Sick Leave `10/13/15` days (no 60-day hospitalisation leave); OT `≥1.0× HRP` up to full-time normal hours, **`1.5× HRP`** only above full-time normal hours.
- **Proposed Solution:**
  1. Split Rest Day and Public Holiday hours in `PayrollEmployeeInput` into `withinNormalHours` vs `otBeyondNormalHours` (and compute `0.5/1.0` ORP or `2.0` days ORP correctly).
  2. Add `isManualWorker?: boolean` to bypass the `RM4,000` OT exclusion.
  3. Add a `Part-Time` / `"Disguised Freelancer"` audit mode implementing `RM8.72/hr`, `P.U.(A) 303/2010` OT (`1.0×`/`1.5×`), and Day-1 statutory EPF/SOCSO/EIS checks.

---

### 5. Act 872 `s.14` Suspension Cap, 7-Day Penalty & 50% Back-Pay (`src/lib/engines/gigEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:** `gigEngine.ts` currently treats any suspension exceeding `14` days as automatically breached and awards flat `suspensionDaysElapsed × averageDailyEarningsRm × 0.5` unconditionally.
- **Verification (Act 872 `s.14` + KESUMA Official FAQ Q41–Q42):**
  - **14-day limit (`s.14(3)–(4)`):** Written notice required; platform inquiry suspension max **14 days**.
  - **Extra 7 days (`s.14(6)(b)`):** NOT an extension of the 14-day inquiry window—it is a **post-inquiry disciplinary penalty** (up to 7 further days without termination) if valid grounds/misconduct are proven after giving the gig worker a right to be heard.
  - **50% Back-Pay Formula (`s.14(5)(b)` vs KESUMA FAQ Q42):** Applies **ONLY** when the platform concludes **no valid grounds** existed for deactivation (must reactivate immediately + pay half average daily earnings). While `s.14(5)(b)` references active service days in the prior 30 days, **KESUMA FAQ Q42** specifies averaging **only the $N$ most recent active days** in the preceding 30 days (where $N$ = length of suspension).
- **Proposed Solution:**
  1. Add `deactivationOutcome: "pending_inquiry" | "no_grounds_found" | "misconduct_proven"` and `recentActiveDaysEarningsRm?: number[]` to `GigCaseInput`.
  2. Compute the Q42 average over the `$N$` most recent active days (fallback to provided `averageDailyEarningsRm` with an explicit note when granular daily logs aren't uploaded).
  3. Mark 50% back-pay as `"Verified"` only when `no_grounds_found`, `"Potential"` when inquiry is still pending or past day 14, and `RM0` if `misconduct_proven` (capped post-inquiry disciplinary suspension at 7 days).

---

### 6. Act 872 `s.11` Payment Default, `s.3` Terms, `s.2` Coverage & `s.17–19` Disputes (`src/lib/engines/gigEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:**
  1. `gigEngine.ts` flags *every* unpaid job `>7` days after completion as overdue without checking if the contract sets another payment term.
  2. It checks `statesSuspensionProcess` as part of the `s.3` written agreement audit.
  3. It lacks Citizen/PR and Platform-vs-Direct-Client screening (`s.2` & Schedule).
  4. `auditFindings` jump straight to mentioning the **Gig Workers Tribunal** without checking `s.17–19` conditional steps.
- **Verification:**
  - **`s.11(1)`:** The 7-day statutory default triggers only where the service agreement **provides no terms and conditions relating to payment of earnings** (flag if contract specifies e.g. Net 30).
  - **`s.2` & `s.3`:** Agreements can be **oral or written** (`s.2`, Q18). `s.3` lists **7 statutory particulars `(a)`–`(g)`** (parties, duration, services, obligations, rate & particulars of earnings, payment method, benefits/tips/gratuities—suspension review is governed under **`s.14`**, not `s.3`).
  - **Coverage (`s.2` & Schedule):** Only **Malaysian Citizens & PRs** qualify. Platform providers cover gig riders and platform-hired freelancers; **direct-client freelancers** are restricted to the **exact 9 Scheduled services**: Acting, Filming, Music, **Aesthetic** *(make-up artist, hair stylist, stylist — NOT broad "beauty/wellness")*, Translation/Interpreting/Transcribing, Journalism, Prenatal & postnatal care, Palliative/elderly/rehab care, and Photography & videography. Non-covered direct freelancers route to **Small Claims `Order 93 Form 198`** (`≤RM5,000`; **sole proprietors CAN file** as Plaintiffs trading under their Enterprise name; Sdn Bhd/LLP/partnerships cannot).
  - **Conditional Dispute Router (`s.17–19` + `P.U.(A) 146/2026`):** Normally 30-day internal company complaint → **JPPM Conciliation (file within 60 days)** → Conciliator refers unresolved disputes to **Gig Workers Tribunal** (`s.19`, no lawyers, Tribunal awards within 30 days where practicable, 14-day High Court appeal). **Exceptions skipping the 30-day internal wait straight to JPPM Conciliation:** (a) contracting party is an individual or sole proprietor (`s.17(1)`), (b) no internal mechanism exists (`s.18(3)`), (c) worker is dissatisfied with an issued internal decision, or (d) **`s.14` platform deactivation disputes** (`s.17(3)`).
- **Proposed Solution:**
  1. Add `hasPaymentTermsInContract?: boolean`, `contractPaymentDays?: number`, `hiringChannel?: "platform" | "direct_client"`, `isCitizenOrPr?: boolean`, `scheduledSector?: string`, and `counterpartyType?: "company" | "individual_or_sole_prop"` to `GigCaseInput`.
  2. Enforce `7`-day default only when `!hasPaymentTermsInContract` (otherwise compare against `contractPaymentDays`).
  3. Separate `s.3` (7 contract terms) from `s.14` (suspension review) in findings, fix Schedule terminology to `"Aesthetic"`, route non-covered direct freelancers cleanly to `Form 198`, and output the exact conditional `s.17–19` escalation step + 60-day JPPM clock.

---

### 7. PERKESO `Lindung Kendiri` (`Borang PS 2`) & KWSP `i-Saraan Plus` (`src/lib/engines/gigEngine.ts`, `src/data/statutory-2026/rules.ts`)
- **Finding:** `gigEngine.ts` applies the RM500/yr `i-Saraan` cap to platform riders (like `Kumar`), runs the `1.25%` PERKESO check uniformly without distinguishing platform providers vs direct clients, and omits SKSPS benefit-claim form guidance.
- **Verification:**
  - **SKSPS / `Lindung Kendiri` (`P.U.(A) 143/2026` + Act 789):** The mandatory `1.25%` per-transaction deduction applies **only to platform providers** (direct non-platform clients have no deduction duty, Q117), feeding Act 789's 4 Plans (Plan 1 min `RM13.10/mo` / `RM157.20/yr`). Self-employed/gig accident claims use **`Borang PS 2`** (*Borang Tuntutan Faedah Skim Pekerjaan Sendiri*), **NOT `Borang 34`** (which is for formal employed workers under Act 4).
  - **`i-Saraan Plus` (from 1 Jan 2026):** Eligible e-hailing and p-hailing platform riders receive a **20% match up to RM600/year** (`RM6,000` lifetime) rather than standard `i-Saraan`'s `RM500/year` (`RM5,000` lifetime). Workers cannot claim both in the same year.
- **Proposed Solution:**
  1. Apply `RM600/yr` cap (`i-Saraan Plus`) when `roleType === "gig_rider"` on a platform, and `RM500/yr` (`i-Saraan`) for other self-employed workers.
  2. Enforce `1.25%` deduction checks only for platform providers (and note Plan 1 `RM13.10/mo` top-up threshold).
  3. Include **`Borang PS 2`** (not `Borang 34`) in gig/rider accident claim instructions and checklists.

---

### 8. Dead STAMPS Link, ILMU TTS Model ID & `types.ts` Contract Sync (`src/lib/ilmu/client.ts`, `.env.example`, `src/data/statutory-2026/rules.ts`, `src/lib/engines/types.ts`, `src/tests/engines.test.ts`)
- **Finding:** `.env.example` and `client.ts` specify `ILMU_TTS_MODEL=ilmu-tts-v2`; any reference or fallback link to `stamps.hasil.gov.my` is obsolete; Huien's UI redesign adds `Verified` vs `Potential` badges, message tone options, and a unified `Ask Hakku` chat flow.
- **Verification:** LHDN officially shut `stamps.hasil.gov.my` at **6:00 PM, 31 Dec 2025**; all stamping since **1 Jan 2026** runs exclusively on **`https://mytax.hasil.gov.my`** (`e-Duti Setem`). Also check `console.ilmu.ai` / `docs.ilmu.ai` for whether live TTS expects `ilmu-tts-v2.1` vs `ilmu-tts-v2`.
- **Proposed Solution:**
  1. Ensure no backend prompt, link, or fallback points to `stamps.hasil.gov.my` or broken `minimumwages.mohr.gov.my` / 404 `hasil.gov.my` URLs—standardize on `https://mytax.hasil.gov.my`, `https://jtksm.gov.my/en`, `https://eaduan-gig.mohr.gov.my/`, and `https://www.workforworkers.com.my/`.
  2. Verify live `ILMU_TTS_MODEL` ID in `console.ilmu.ai` (`ilmu-tts-v2.1` vs `ilmu-tts-v2`).
  3. Add backward-compatible fields to `src/lib/engines/types.ts` (e.g., `confidence?: "verified" | "potential" | "info"` on `AuditFinding`, `tone?: "friendly" | "firm" | "formal_bm"` on `/api/ilmu/draft`) so Huien's new UX maps directly to real engine output.
  4. Update `src/tests/engines.test.ts` so `npx tsc --noEmit && npm test && npm run build` stays green.

---

## Priority 2 — Nice-to-Have Legal Accuracy Upgrades (If Time Permits)
1. **EPF Act 1991 (`payrollEngine.ts`):**
   - **PRs aged 60–75 (`Part C`):** `0% / 4%` (`Part E`) applies to **Malaysian citizens 60–75** only; Permanent Residents aged 60–75 use **`Part C`** (`5.5%` employee / `6.5%` employer `≤RM5,000`, `6.0%` `>RM5,000`). Mandatory EPF stops at age 75.
   - **Bonus-Month 13% Rule:** If regular monthly salary is `≤RM5,000` and a bonus pushes that month's combined pay `>RM5,000`, the employer EPF rate **stays 13%**.
2. **Commercial Freelance Stamp Duty (`stampDutyEngine.ts`):** Direct commercial freelance contracts for service fall under **`Item 22(1)(a)`** (remitted to **`0.1%`** via `P.U.(A) 428/2021`, sub-contracts capped at `RM50`), legally payable by the **client** (`Third Schedule, Item 2`).
3. **EIS 2026 (`Act A1796`, effective 1 Oct 2026):** Rates stay `~0.2% + 0.2%` (`RM6,000` ceiling, exempt if `≥57` with no prior EIS), with upgraded benefits (`RM7,000` training cap, `RM1,000` Mobility Allowance) and upcoming **2 Jan 2027** mandatory job-vacancy reporting (`s.11`).
