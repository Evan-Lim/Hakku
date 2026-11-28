# Hakku QA Bug-Fix List for Huien (UI, Dark Mode, Mobile & Copy)

The QA run below was reported on commit `8eec5cd`. Use the [reviewed Step 5 examples](Hakku_Step5_and_Messages_Reviewed.md) for the corrected amounts, case inputs and follow-up conditions.

**Branch Tested:** `be/agent-autofile` (commit `8eec5cd`)  
**Prepared by:** Research & QA Teammate · **Date:** 28 November 2026  
**Your Scope (`AGENTS.md`):** `src/app/**/page.tsx`, `src/components/**`, `src/lib/i18n/dictionary.ts`, `src/lib/store/HakkuContext.tsx`, `src/lib/ilmu/browserBridge.ts`

### Browser QA Snapshot
- Tested on Desktop (`1280×800`) and Mobile (`390×844`) in **Light & Dark Mode** and **EN & BM** across `/`, `/tanya`, `/lapor`, `/workspace`, `/portals/*`, and `/vision`.
- **`0` console errors** and **`0` HTTP 4xx/5xx API errors**—every flow runs cleanly, and fixing the UI bugs below will make the app ready for real testers next week!

---

## P0 — Critical UI & State Bugs (Fix First)

### 1. `/lapor` Dark Mode Invisible Text (`src/app/lapor/page.tsx`) — URGENT
- **What Happened:** In Dark mode (`1280×800` & `390×844`), all `<input>` fields (`Nama pengadu`, `No. Kad Pengenalan`, `No. telefon`, `Nama majikan`, `Alamat tempat kerja`, `Kategori aduan`, `Bulan berkaitan`, `Jumlah dituntut`) and the `Keterangan aduan` `<textarea>` stay **pure white (`#ffffff`)** while the text turns white/light—everything prefilled or typed by the user becomes **100% invisible**.
- **Proposed Fix:** Style `/lapor` inputs and textareas with proper Dark-mode background and foreground text classes matching `/workspace` (e.g. MYDS input tokens or explicit `bg-bg-white text-txt-black-900 dark:bg-zinc-900 dark:text-zinc-100`).

### 2. Cross-Case State Leak When Switching Without Refreshing (`src/app/tanya/page.tsx`)
- **What Happened:** Clicking `"Ask about something else"` to switch **Employee → Gig Rider → Freelancer** without reloading leaked 3 pieces of old state:
  1. **`support@grab.com`** from the Gig Rider case stayed inside the **Freelancer's** `Open in Gmail` `To:` link!
  2. The `Email` send radio option remained selected instead of resetting cleanly.
  3. The yellow `Listen` warning banner (`"Your device has no voice for this language..."`) remained stuck on subsequent cases.
- **Proposed Fix:** Reset `channel`, `emailTo`, `ttsWarning`, and stop any active audio playback inside the `"Ask about something else"` reset handler.

### 3. `/tanya` Drafts Are Read-Only, No Upload Button & False `"Attached"` Text (`src/app/tanya/page.tsx`, `/workspace`)
- **What Happened:**
  - Users **cannot edit** the drafted WhatsApp, Email/Gmail, or Formal BM text on `/tanya` before clicking `Copy` or `Open in Gmail` (`0` `<textarea>` elements).
  - `/tanya` currently has **no file/photo upload button** (only text + `Speak`), and `/workspace`'s OCR card + payslip deductions (`OT RM140`, `EPF RM209`, `Lindung RM15.40`) + employee ID/branch/month are read-only text.
  - Because drafts say *"4. Bersama-sama ini saya lampirkan dokumen sokongan..."*, users who click `Open in Gmail` or paste into WhatsApp may assume Hakku attached their files automatically.
- **Proposed Fix:** Convert the Step 6 message preview into an editable `<textarea>` before Copy/Send, add an image/PDF upload trigger on `/tanya`, make extracted fields editable, and add a helper note reminding users to attach files manually in Gmail/WhatsApp (with updated wording).

### 4. `/lapor` Placeholder & Field Sync Issues (`src/app/lapor/page.tsx`)
- **What Happened:**
  - `Nama majikan` (`f-employerName`) and `Nama platform` prefill literal `"[nama majikan]"` / `"[nama platform]"` / `"[nama klien]"` with a **green `"filled by Hakku"` badge**, making it look done when it isn't.
  - Typing `Nama pengadu` and `No. telefon` does **not** automatically replace `[nama penuh]` / `[no. telefon]` inside `Keterangan aduan`.
- **Proposed Fix:** When company/platform/client name wasn't extracted, leave the input empty with amber `"you fill this in"` status (like `Nama pengadu`), and live-sync `Nama pengadu`, `No. telefon`, and `Nama majikan`/`Nama platform` directly into the `Keterangan aduan` letter body.

---

## P1 — Cross-Page Sync, Read-Aloud & UX Fixes

### 5. `/workspace` Template & Cover-Sheet Mismatches (`src/components/workspace/DraftingAndRagStudio.tsx`, `StampDutyPanel.tsx`)
- **What Happened:**
  - Clicking `Aina (Worker)` / `Full-Time Worker` leaves Guided Resolution defaulted to `"Polite Client / Platform Payout Reminder (Act 872)"`, generating a Gig Workers Act letter for an Employment Act payslip.
  - Opening `/workspace?role=sme` defaults to an employee-to-HR letter (or previous persona `"Hafiz Studio Creative"`), and selecting `MyTax e-Duti Setem / PKPS Filing Cover` prints **`Assessed Stamp Duty: RM36.00`** (Budi's EPF gap) instead of the `RM658.00` Stamp Duty.
- **Proposed Fix:** Auto-select the matching Guided Resolution template whenever persona/preset switches, and bind the `MyTax` cover draft to `stampDuty` results rather than payroll variance.

### 6. `/portals/mytax` & `/portals/kesuma` Sync Mismatches (`HakkuContext.tsx`, `/portals/*`)
- **What Happened:**
  - Computing a 1-year `RM4,500` lease (`RM226.00`) in `/workspace` still displayed **`RM 658.00`** (two-year demo preset) when navigating to `/portals/mytax`.
  - Navigating to `/portals/kesuma` Tribunal tab after SME payroll paired SME's `RM 36.00` EPF gap with `KilatGo Delivery Sdn Bhd`.
- **Proposed Fix:** Keep `HakkuContext` lease duration/duty synced cleanly to `/portals/mytax`, and isolate SME payroll gaps from the Gig Tribunal claimant amount.

### 7. `Listen` Audio Controls & Language Coverage (`/tanya`)
- **What Happened:** Only one bare `Listen` button exists (no `BM` / `EN` / `Mandarin` / `Cantonese` picker, and no pause/progress controls; desktop Chromium shows `"Your device has no voice for this language, so the closest one is used"`).
- **Proposed Fix:** Wire `ilmu-tts-v2` / `v2.1` audio playback (with language selector + Play/Pause/Stop state) so judges can hear real Malaysian voice synthesis rather than browser Web Speech fallback.

### 8. Mixed Language Shell on BM Prompts (`/tanya`)
- **What Happened:** Typing BM/Manglish while the navbar toggle is set to EN switches the clarification questions to BM (`Berapa jam...`), while keeping placeholders (`Type a number`), buttons (`Continue`), and result cards in English.
- **Proposed Fix:** Either sync detected prompt language smoothly with copy in `dictionary.ts` or show a one-click banner (`"Switch page to Bahasa Melayu?"`).

---

## P2 — Mobile (`390×844`), Desktop Navbar & Visual Polish

1. **Fix `12px` Mobile Horizontal Overflow (`AppShell.tsx` & pages):** At `390×844`, `/`, `/tanya`, `/lapor`, and `/workspace` all have ~12px horizontal page scroll (`body.x = -12`), clipping the right border of the mobile hamburger button.
2. **Fix Cramped `390px` Header & Desktop Navbar Collapse (`AppShell.tsx`):**
   - At `390px`, `Hakku` touches the `BM` button (`~0px` gap) and `Connect MyDigital ID` wraps onto 2 lines and overflows the header bottom border; Dark-mode announcement banner shows a mismatched dark box behind text.
   - Switching to `BM` at `1280×800` / `/portals` collapsed desktop nav links into the hamburger menu unnecessarily.
   - Add a clear link/step-jump navigation (like your sidebar idea) so users can jump between `/`, `/tanya`, `/lapor`, `/workspace`, and `/portals`.
3. **Dark-Mode Scrollbars, `Copy` Contrast & Modal Height:**
   - Apply dark scrollbar styling on the `/tanya` BM report container and `/workspace` payroll table.
   - Darken the green `Copy` button background (`#15803D` / `#166534`) so white text passes WCAG contrast.
   - Ensure the MyDigital ID dialog action buttons (`Cancel` / `Approve & Connect Profile`) stay visible without scrolling on `800px`-tall laptop screens.
4. **`/lapor` Badge Wrapping & `/workspace` Table Clipping on Mobile (`390×844`):** Prevent `"you fill this in"` / `"filled by Hakku"` badges from wrapping onto 2 lines (`whitespace-nowrap shrink-0`), and make SME payroll employee rows use mobile cards below `640px` instead of squeezing a `906px` table into `301px`.
5. **Minor Copy & Accessibility Fixes:**
   - Update `/portals` and `/vision` copy from `"5 statutory portals"` to **`"4"`** (to match the 4 cards: PERKESO, KWSP, KESUMA, MyTax).
   - Remove the nested `<main>` inside `<main>` on `/tanya`.
   - Fix slight header button wrapping (`ILMU: Demo` and `Connect MyDigital ID`) in `/workspace` at `1280×800`.

---

## Ready-to-Paste AI Prompt for Huien

```text
Fix these UI/UX bugs found during our multi-agent browser QA on branch be/agent-autofile (keep all changes inside frontend files per AGENTS.md):

1. URGENT Dark Mode on /lapor: Give all <input> and <textarea> fields on src/app/lapor/page.tsx proper dark-mode backgrounds and contrasting text colors (currently white text on white background). Also add whitespace-nowrap shrink-0 to the "you fill this in" / "filled by Hakku" pills.
2. Fix /tanya State Leak on Case Switch: Inside "Ask about something else" on src/app/tanya/page.tsx, reset emailTo (currently leaks support@grab.com onto the next Freelancer case), reset the WhatsApp/Email radio selection, clear the yellow Listen warning banner, and stop any audio playback. Also remove the nested <main> tag.
3. /tanya Draft Editability & Placeholders: Make the drafted message on /tanya editable in a <textarea> before Copy / Open in Gmail, add a manual-attachment reminder (don't claim files are attached automatically), and add a file/image upload option if supported. On /lapor, leave unextracted Nama majikan / Nama platform blank with "you fill this in" (never green "filled by Hakku" on literal "[nama majikan]"), and live-sync Nama pengadu / No. telefon / employer into Keterangan aduan.
4. Fix Mobile 390px Overflow & Header: Remove the ~12px horizontal overflow across /, /tanya, /lapor, /workspace; give the 390px header breathing room so Hakku doesn't touch BM and MyDigital ID doesn't overflow the bottom border; prevent desktop nav links from collapsing on BM toggle or /portals; style SME payroll rows cleanly for mobile instead of clipping a 906px table.
5. Contrast, Scrollbars & Sync: Darken the green Copy button for contrast, theme Dark-mode scrollbars, keep MyDigital ID modal footer buttons visible on 800px-height screens, fix /workspace Guided Resolution auto-selection when switching presets (Aina/SME) + MyTax cover duty sync + /portals/mytax one-year input vs two-year preset, and update "5 portals" copy to "4".
```
