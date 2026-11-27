# Hakku Frontend UX, Links & Copy Review — Handoff for Huien

**Recipient:** Huien (Frontend Owner per `AGENTS.md`: `Hakku web app.html` redesign, `src/app/**`, `src/components/**`, `src/lib/i18n/dictionary.ts`, `src/lib/ilmu/browserBridge.ts`)  
**Prepared by:** Research Teammate  
**Verified Date:** 27 November 2026  

Love the clean 6-step mobile UI and **Ask Hakku** drawer in `Hakku web app.html`! Here is everything we found from testing your clickable mockup links live and checking every screen against 2026 Malaysian law, kept simple and ready for you to paste into your AI on a `fe/` branch.

---

## 1. Live Government Link Audit (Tested 27 Nov 2026)

- **Finding:** Several official `.gov.my` links inside `const U` of `Hakku web app.html` either return `404`, time out, or point to portals that Malaysia has already replaced—and two key complaint portals are missing.
- **Verification (Live HTTP Check Results):**

| Label in `Hakku web app.html` | Current URL | Live Check Result | Verified Replacement / Action |
|---|---|---|---|
| `HASIL` (`LHDN · e-Duti Setem`) | `https://www.hasil.gov.my/en/quick-links/services/e-duti-setem/` | **FAIL (`404`)** | Replace with **`https://mytax.hasil.gov.my`** (`200 OK`, `e-Duti Setem`). **Do NOT use `stamps.hasil.gov.my`**—LHDN shut STAMPS on **31 Dec 2025 (6:00 PM)**. |
| `MW` (`Minimum wage portal`) | `https://minimumwages.mohr.gov.my` | **FAIL (Timed out)** | Replace with **`https://jtksm.gov.my/en`** (`200 OK`). |
| `EA` (`Employment Act PDF`) | `https://jtksm.mohr.gov.my/sites/default/files/...` | Redirects | Update directly to `https://jtksm.gov.my/sites/default/files/2023-11/Akta%20Kerja%201955%20(Akta%20265).pdf` (`200 OK`). |
| `JC` (`How to complain to JTKSM`) | `https://jtksm.mohr.gov.my/en/services/labour-complaint/acts-guidelines` | Redirects | Update directly to `https://jtksm.gov.my/en/services/labour-complaint/acts-guidelines` (`200 OK`). |
| `PK` (`PERKESO`) | `https://www.perkeso.gov.my` | **OK (`200`)** | Keep as is. |
| `L24` (`LINDUNG 24 Jam`) | `https://www.perkeso.gov.my/en/our-services/protection/lindung-24-jam.html` | **OK (`200`)** | Keep as is. |
| `GIG` (`Act 872`) | `https://www.mohr.gov.my/aktapekerjagig2025/` | **OK (`200`)** | Keep as is. |
| `MYTAX` (`MyTax portal`) | `https://mytax.hasil.gov.my` | **OK (`200`)** | Keep as is. |
| `KWSP` (`KWSP`) | `https://www.kwsp.gov.my` | `403` to bots only (live in browser) | Keep as is. |
| *(Missing)* Gig Complaint Portal | — | **New (`200 OK`)** | Add **`https://eaduan-gig.mohr.gov.my/`** inside Gig Rider & Freelancer Act 872 "Details". |
| *(Missing)* Employee Complaint Portal | — | **New (`200 OK`)** | Add **`https://www.workforworkers.com.my/`** inside Employee JTKSM / WFW "Details". |

- **Proposed Solution:** Swap the two dead URLs, update the two redirecting JTKSM URLs, and add `eaduan-gig.mohr.gov.my` and `workforworkers.com.my` inside the Details bottom sheet (`U` + `LAW`).

---

## 2. Screen Copy, Questions & Math Fixes (`Hakku web app.html`)

### A. Employee Screen (`Aina`)
- **Finding:**
  1. Currently marks *"Basic pay below RM1,700"* as **Potential** (*"Are you full-time?"*), while marking overtime (`+RM56.08` using `RM8.17/hr`, which assumes `RM1,700`) as **Verified**.
  2. Has no **Part-Time / "Fake Freelancer"** check (`RM8.72/hr` minimum wage + EPF/SOCSO when a boss sets fixed shifts even if called "freelance")—the easiest real case for university friends to test next week.
  3. *Lindung 24 Jam* question only asks *"Did you opt out?"* without noting the **31 Aug 2026** opt-out deadline or that **June 2026** deductions were non-refundable.
- **Verification:** Part-time workers (`>30%` to `≤70%` full-time hours) use **Part-Time Employees Regulations 2010** (`RM8.72/hr` floor, `1.0×` OT up to FT hours / `1.5×` after). For *Lindung 24 Jam* (effective **1 June 2026**), locals had until **31 Aug 2026** to opt out; **first-time local hires after 31 Aug 2026** and **all foreign workers** are strictly mandatory, and it applies to Category 2 (`60+`) too.
- **Proposed Solution:** Add Step 4 quick questions *"Are you full-time or part-time (15–33 hrs/wk)?"* (plus *"Does your boss control your shifts/tools?"* if labeled freelance) and *"Did you opt out of Lindung 24 Jam before 31 Aug 2026 (hired before Sept 2026)?"* before showing **Verified** badges.

### B. Gig Rider Screen (`Kumar`)
- **Finding:**
  1. Draft message & escalation jump straight to the **Gig Workers Tribunal** after a 7-day reminder, without showing **JPPM Conciliation (60-day filing limit)**.
  2. Shows 50% suspension allowance unconditionally without clarifying when it legally applies (`no grounds found`) or that a post-inquiry 7-day suspension penalty (`s.14(6)(b)`) is different from the 14-day inquiry cap.
  3. Missing the **1.25% PERKESO `Lindung Kendiri`** check (present in GitHub repo, missing in HTML) and uses `RM500` instead of **`i-Saraan Plus` (`RM600/yr`)**. Also ensure accident guidance says **`Borang PS 2`**, **never `Borang 34`**.
- **Verification:** Under Act 872 `s.17–19` & `P.U.(A) 146/2026`, deactivation disputes skip the 30-day internal wait and go directly to **JPPM Conciliation within 60 days**, and the Conciliator refers unresolved cases to the Tribunal. Self-employed/gig riders claim PERKESO SKSPS under Act 789 with **`Borang PS 2`** (not `Borang 34`), and qualify for **`i-Saraan Plus`** (`RM600/yr` cap, `RM6,000` lifetime).
- **Proposed Solution:**
  - Change Kumar's escalation text to: *"Next step: File for JPPM Conciliation within 60 days (platform deactivations skip the 30-day wait) → Conciliator refers to Gig Workers Tribunal."*
  - Mark the 50% back-pay as **Potential** while inquiry is pending, noting in Details that 50% back-pay applies if no valid grounds are found (averaged over the `$N$` most recent active days in the prior 30 days, KESUMA FAQ Q42).
  - Add the `1.25%` `Lindung Kendiri` card + `Borang PS 2` document checklist, and update rider EPF match to **`i-Saraan Plus` (`RM600/yr`)**.

### C. Freelancer Screen (`Hafiz`)
- **Finding:**
  1. Applies Act 872's 7-day payment rule automatically without asking whether a written payment term exists or whether the user was hired through a **platform** or a **direct client**.
  2. Uses broad wording instead of the Act 872 Schedule's exact scope and lacks a fallback to **Small Claims (`Order 93 Form 198`)**.
- **Verification:** Act 872 `s.11` 7-day payment default only applies when the agreement has **no payment terms**. Under `s.2` & the Schedule (Malaysian Citizens/PRs only), platform-hired freelancers can be covered broadly, while **direct-client freelancers** are restricted to the **9 Scheduled sectors** (note: use **"Aesthetic: make-up, hair styling, styling"** instead of broad "beauty/wellness"). Direct freelancers outside the 9 sectors (e.g., direct coding/tutoring) fall back to **Small Claims `Form 198`** (`≤RM5,000`, where **sole proprietors CAN file** as Plaintiffs).
- **Proposed Solution:** Add two Step 4 questions: *"Were you hired through a gig platform or directly by a client?"* and *"Did your agreement state a payment date?"* Route non-covered direct freelancers cleanly to `Small Claims Form 198` (`≤RM5,000`) instead of Act 872.

### D. SME Screen (`Encik Razak`)
- **Finding:** Demo shop lease signed **45 days ago** (late 2026) claims **"PKPS amnesty: no late penalty if stamped by 31 Dec 2026"**, and `Item 4` copy implies a simple salary-only test without clarifying allowances or `Item 34`.
- **Verification:** PKPS amnesty only covers contracts signed **1 Jan 2023 – 31 Dec 2025**. A 2026 lease signed 45 days ago does **not** qualify (`s.47A` late penalty applies: `RM50` or `10%` `≤3` months late; `RM100` or `20%` `>3` months late). `Item 4` (`RM3,000`) includes fixed allowances; duplicate copy duty cites **Item 34**.
- **Proposed Solution:** Change `Encik Razak`'s demo lease signing date to **2025** (if keeping the PKPS amnesty badge) OR remove the PKPS line and display the normal `s.47A` late penalty.

---

## 3. Recommended UX & Feature Additions (Easy to Demo, High Judge Score)

1. **Step-Jump Navigation Sidebar (Your Idea #1):** Persistent left sidebar on desktop + collapsible drawer on mobile letting users jump straight between Steps 1–6 and Dashboard anytime without clicking `Back` repeatedly.
2. **EN / BM Top-Bar Toggle:** Match `AGENTS.md` and the GitHub `dictionary.ts` right in the top bar (not only inside Ask Hakku chat).
3. **3-Tone Message Switcher + `Copy` & `Download PDF` on Step 6:** Let users switch between **Friendly**, **Firm**, and **Formal BM** drafts, copy the text cleanly, or export a PDF pack.
4. **🔊 "Listen" Button on Step 5 (Result Page):** Reads the plain-language summary aloud in **BM / EN / Mandarin / Cantonese** via YTL ILMU TTS.
5. **Privacy Blur Preview + `"Processed in Malaysia · YTL ILMU"` Badge:** Show the uploaded slip with IC/bank digits visibly masked in black bars and show the cropped source line inside the Details pop-up next to *"From your document"*.
6. **Rider PERKESO Injury Checklist (`Borang PS 2`):** Simple interactive tick-box list (24h police report, original MC, MyKad copy, bank statement, delivery log, `Borang PS 2`).
7. **Keep No Login Wall:** Let users run the entire check instantly without registering—makes real-user testing with friends on Dec 3 & Dec 6 super fast.

### Features Present in GitHub (`Evan-Lim/Hakku`) Missing from `Hakku web app.html`
*(In answer to your question: "if lost any features lemme know ya")*
- **Light / Dark Mode Toggle:** Required in `AGENTS.md` (already supported in the GitHub Next.js app), currently missing in the HTML mockup.
- **ILMU `Demo / Live API` Navbar Switch:** Existed in the GitHub header so judges and testers can toggle live YTL ILMU inference on demand (with graceful fallback if `ILMU_API_KEY` isn't set).
- **MyDigital ID Modal, Government Portal Mirrors (`/portals/*`) & Production Vision (`/vision`):** Present in the GitHub app, omitted from the streamlined HTML flow. Decide with Evan whether to drop them to keep the 6-step flow laser-focused, or tuck them neatly as secondary links at the bottom of your new sidebar.
- *(Note: The old Law Q&A / RAG search panel is cleanly upgraded into your **Ask Hakku** chat drawer, and `1.25%` PERKESO + EN/BM toggle + voice playback are already covered in the sections above.)*

---

## 4. Ready-to-Paste AI Prompt for Huien

Copy-paste this directly into your AI coding tool:

```text
Update the Hakku frontend flow with these improvements (keep no login required before running a check):

1. Step-Jump Sidebar & Navigation: Add a left sidebar on desktop and a slide-out menu button on mobile so users can jump directly to any step (Dashboard, Step 1 Who, Step 2 Upload, Step 3 Confirm, Step 4 Questions, Step 5 Results, Step 6 Action) without clicking Back repeatedly. Optionally include secondary links in the sidebar (e.g. Official Portals / Vision / MyDigital ID demo) if we keep those routes.
2. Top-Bar Controls: Add an EN / BM language toggle, a Light / Dark mode toggle (per AGENTS.md), and a clean ILMU Demo / Live API indicator or toggle in the header.
3. Fix Government Links in Details:
   - Replace broken LHDN e-Duti Setem URL with https://mytax.hasil.gov.my (never use stamps.hasil.gov.my as it closed Dec 2025).
   - Replace timed-out minimumwages.mohr.gov.my with https://jtksm.gov.my/en.
   - Update JTKSM URLs to https://jtksm.gov.my/... (not jtksm.mohr.gov.my).
   - Add https://eaduan-gig.mohr.gov.my/ (for Act 872 claims) and https://www.workforworkers.com.my/ (for JTKSM employee complaints).
4. Fix Demo Legal Content & Step 4 Questions:
   - Employee: Ask "Full-time or Part-time (15–33 hrs/wk)?" and "Does boss set fixed shifts even if called freelance?" (Part-time checks RM8.72/hr floor + EPF). For Lindung 24 Jam, ask "Did you opt out before 31 Aug 2026 (hired before Sept 2026)?"
   - Gig Rider: Add 1.25% PERKESO Lindung Kendiri check + Borang PS 2 (NOT Borang 34) accident document checklist; change i-Saraan cap to i-Saraan Plus (RM600/yr); mark pending suspension 50% back-pay as Potential (applies when no valid grounds found, averaged over N most recent active days); update escalation to "JPPM Conciliation within 60 days (deactivation skips 30-day wait) -> Gig Workers Tribunal".
   - Freelancer: Ask "Hired via a gig platform or direct client?" and "Was a payment date stated in writing?" (7-day default only if no payment terms stated; non-covered direct freelancers route to Small Claims Form 198).
   - SME Shop Lease: Update Encik Razak's lease date to 2025 so PKPS amnesty is legally accurate (PKPS only covers 2023–2025 instruments, not 2026).
5. Step 5 & Step 6 High-Impact Features:
   - Add a "Listen" button on Step 5 (Result) for BM/EN/Mandarin/Cantonese audio summary.
   - Show a blurred IC/bank-number preview + "Processed in Malaysia · YTL ILMU" badge and uploaded document snippet inside the Details sheet.
   - On Step 6 (Action), add tone pills (Friendly / Firm / Formal BM) plus Copy Text and Download PDF buttons.
```

> **Quick Team Check (`AGENTS.md` vs. Mockup):** `AGENTS.md` currently requires using Malaysia Government Design System (`@govtechmy/myds-react`), while `Hakku web app.html` uses a softer rounded consumer UI. Confirm with Evan whether to port these screens using MYDS components/tokens or update `AGENTS.md` to allow the consumer style—and remember to coordinate any new API/type fields with Evan (`src/lib/engines/types.ts`).
