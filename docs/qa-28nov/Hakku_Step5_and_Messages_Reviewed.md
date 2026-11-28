# Hakku · Four reviewed Step 5 cases and message drafts

**Research and QA handoff for Evan and Huien · 28 November 2026**

Use the dated examples below as synthetic acceptance cases. Names and references identify the test. Dates, eligibility answers and document contents explicitly supplied here are test inputs. In a live case, fill these from an uploaded record or a user answer. When either is missing, show the question and keep dependent amounts pending. A figure that the user reports can be repeated with attribution.

## What the current engines return

I ran the existing calculation functions from commit `8eec5cd`. These are engine observations. Screens, exports and phone audio require separate tests. [Repository snapshot](https://github.com/Evan-Lim/Hakku/tree/8eec5cd)

| Case | Observed | Acceptance target |
|---|---|---|
| Aina | The payroll preset returns RM196.08 expected OT and assumes an opt-out. | Ask for missing work and opt-out facts. Explain the rounding used. Hold the net adjustment until payroll inputs are complete. |
| Kumar | With RM640 unpaid, 19 days suspended and RM100 daily earnings, the gig engine returns RM1,590 total claimable. | Show RM640 unpaid and a separate conditional RM950 illustration. |
| Hafiz | With payment terms present and work completed 12 days ago, the gig engine calls RM2,800 five days overdue. | With the Net 30 clause below, show RM2,800 outstanding, RM0 overdue and the actual due date. |
| Budi | The payroll preset returns RM36 per side for EPF, RM24.40 employer SOCSO, RM0 ordinary employee SOCSO and RM14.25 employee Lindung. | For the stated Category 1 wage band, show RM34.15 employer and RM24.40 employee PERKESO including Lindung. |
| Shop lease | The one-year variant returns RM226 duty, the two-year preset RM658 duty. Both return amnesty eligible. | Separate duty from late penalty. An October 2026 execution falls outside the cited amnesty instrument period. |

## 1. Aina · November payslip

**Facts for the test.** Aina Sofia binti Ahmad, SM-042, Seri Mart Trading Sdn Bhd, Subang Jaya. Her November payslip records RM1,650 basic, RM250 transport allowance, RM140 for 16 OT hours, RM209 employee EPF and RM15.40 Lindung 24 Jam. On follow-up she confirms full-time monthly retail employment, a full payable month with no proration, an eight-hour normal day and 16 hours of ordinary working-day OT. The department, employer EPF, exact allowance classification and opt-out record are unknown.

**Step 5.** The monthly basic-pay difference is RM1,700 − RM1,650 = **RM50**. Allowances do not count towards the basic minimum. Using RM1,700 as the ordinary-rate wage base, the current engine rounds the hourly rate to RM8.17, giving RM196.08 expected OT and **RM56.08** above the RM140 paid. Rounding only the final amount gives RM196.15 and **RM56.15** respectively. Show the engine method as an estimate pending verification of the wage base and rounding. Keep the exact gross adjustment, net adjustment and possible Lindung refund open. Ask payroll what the transport allowance covers and whether it has a valid opt-out record. If normal hours or day type is missing, ask before quoting OT. If Aina answers “part-time,” collect agreed hours, comparable full-time hours and actual hours by day before using the part-time rules. [Minimum wage FAQ](https://www.mohr.gov.my/images/mpgn/FAQ%202024.pdf) · [Employment Act, ss.60A and 60I](https://jtksm.mohr.gov.my/sites/default/files/2023-11/Akta%20Kerja%201955%20%28Akta%20265%29.pdf) · [KWSP wage components](https://www.kwsp.gov.my/en/employer/responsibilities/option-contribute) · [PERKESO Lindung FAQ](https://www.perkeso.gov.my/images/lindung/lindung-24-jam/FAQ_Skim_LINDUNG_24_Jam300526.pdf)

**Action and tracking.** Ask payroll for an itemised calculation. If sent on 28 November, suggest checking for a response on **5 December**. This is Aina’s reminder. Keep the payslip, contract, work roster, OT records, any opt-out acknowledgement and payroll reply. If wages remain disputed, prepare the employer particulars, work location, dates, disputed lines and remedy for JTKSM in Peninsular Malaysia. Direct EPF entries to KWSP and Lindung questions to PERKESO. Record any correction and payment separately. [JTKSM labour complaints](https://jtksm.mohr.gov.my/en/services/labour-complaint/acts-guidelines)

**Email to payroll**  
**Subject — November 2026 payslip review · SM-042, Subang Jaya**

Dear Payroll Team,

My November payslip at Seri Mart Trading shows RM1,650 basic pay for a full month and a separate RM250 transport allowance. Could you review the RM50 difference against the RM1,700 monthly minimum? I also received RM140 for 16 hours of ordinary-day overtime. My normal day is eight hours. Please show the wage base, hourly rate and rounding used for those hours.

Please also explain the RM209 employee EPF and RM15.40 Lindung 24 Jam entries and check whether there is an opt-out on record. I would appreciate a written breakdown and the payment date for any adjustment.

Thank you,  
Aina Sofia binti Ahmad · SM-042 · Subang Jaya

**WhatsApp to payroll**  
Hi Payroll, Aina here from Subang Jaya, SM-042. Could you check my November basic pay (RM1,650), my 16 OT hours (RM140 paid), and the RM15.40 Lindung deduction? Please send the calculation and let me know when any adjustment will be paid. Thanks.

**Formal BM letter to payroll**  
Kepada Bahagian Gaji, Seri Mart Trading Sdn Bhd  
**Permohonan semakan slip gaji November 2026 — SM-042**

Tuan/Puan,

Saya Aina Sofia binti Ahmad dari Cawangan Subang Jaya. Bagi sebulan penuh, slip gaji saya mencatatkan gaji pokok RM1,650 dan elaun pengangkutan RM250 secara berasingan. Saya memohon semakan perbezaan RM50 berbanding kadar gaji minimum bulanan RM1,700.

Saya turut menerima RM140 bagi 16 jam kerja lebih masa pada hari bekerja biasa. Waktu kerja biasa saya ialah lapan jam sehari. Mohon nyatakan asas upah dan kadar sejam yang digunakan, serta jelaskan potongan KWSP RM209 dan Lindung 24 Jam RM15.40. Mohon semak sama ada pihak tuan/puan mempunyai rekod pilihan keluar atas nama saya. Saya memohon jawapan bertulis dan tarikh bayaran bagi sebarang pelarasan.

Yang benar,  
Aina Sofia binti Ahmad · SM-042

**Read aloud.** “Your basic pay is fifty ringgit below the full-month minimum. Payroll also needs to check your overtime and deductions. Ask for a written breakdown.”

## 2. Kumar · Unpaid payout and a pending inquiry

**Facts for the test.** Kumar a/l Subramaniam is a Malaysian citizen working through Grab, rider GR-9912. The sample completion record and ledger show PAY-8821, RM640 earned on **7 November**, with no payment through **28 November**. The sample agreement has no payment terms. Account access was suspended for an inquiry on **9 November**. No written outcome has been received. Kumar estimates prior active-day earnings at RM100/day. These dates place completion before loss of access. The original 11-day payout example can be tested on its own using completion on 17 November and no suspension.

**Step 5.** On the combined facts, 7 November + 7 days = **14 November**. RM640 is **14 days overdue** on 28 November. On the standalone 11-day test it is four days overdue. The pending inquiry has lasted 19 elapsed days, beyond the 14-day inquiry period under s.14(3). Request its written status. Under s.14(5), if the platform finds no grounds to deactivate, reactivation and a payment based on half the average daily earnings for the relevant period follow. **RM950 is illustrative** if 19 days apply and prior actual service-day records support RM100/day. Never treat the illustration as a cap or add it to the payable payout while those facts are pending. [Gig Workers Act, ss.11 and 14](https://www.mohr.gov.my/aktapekerjagig2025/assets/documents/Act%20872.pdf)

**Action and tracking.** Contact verified in-app rider support now. Save the ticket, agreement, completion and payout entries, suspension notice, active-day earnings and any written decision, recording which items are available. Suggest a **1 December** status check if sent on 28 November. The suggested check does not delay escalation. Record payout and account access as two outcomes.

**Legal clocks.** For a payout dispute with an applicable internal process, record the written complaint date. Section 17(2) provides 30 days from lodging for internal resolution. Section 17(3) excludes s.14 deactivation disputes from that process. To prepare a written complaint to the JPPM conciliator, identify the applicable regulation 2 event first. For a challenge to the platform’s s.14(9) decision, the 60 days run from the date of the decision given through the written explanation. With no such decision, leave that date open and seek JPPM guidance promptly. Other triggers are the date the dispute arose for an individual/sole proprietor or no mechanism, the contracting entity’s adverse internal decision, or expiry of the 30-day unresolved complaint period, as applicable. Record dates and proof before displaying a deadline. [Conciliation Regulations, regulation 2](https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/3434365/PUA146_2026.pdf) · [KESUMA gig contact and regulations](https://www.mohr.gov.my/aktapekerjagig2025/download.html)

**Email or verified support ticket**  
**Subject — PAY-8821 unpaid and account inquiry · GR-9912**

Dear Grab Rider Support,

I completed the work for PAY-8821 on 7 November. The RM640 remains unpaid as of 28 November. Please check the payout and confirm its settlement date.

Separately, my access has been suspended since 9 November. I have not received the written outcome. Please provide the status, grounds and expected decision date. If there are no grounds for deactivation, please restore my access and provide the earnings calculation for the suspension period. Please give me a reference for both matters.

Thank you,  
Kumar a/l Subramaniam · GR-9912

**WhatsApp or in-app short message**  
Hi Grab Support, Kumar here, GR-9912. PAY-8821 for RM640 is still unpaid. When will it be settled? My account has also been suspended since 9 November. Please send the inquiry status and ticket reference.

**Formal BM letter to the platform**  
Kepada Unit Sokongan Penghantar Grab  
**Aduan bayaran tertunggak dan permohonan keputusan bertulis — GR-9912**

Tuan/Puan,

Saya telah menyelesaikan kerja bagi rujukan PAY-8821 pada 7 November 2026. Setakat 28 November, bayaran RM640 masih belum diterima. Mohon pihak tuan/puan menyemak rekod dan memaklumkan tarikh pembayaran.

Akses akaun saya turut digantung sejak 9 November. Saya memohon status siasatan dan keputusan bertulis berserta alasan. Sekiranya tiada alasan untuk menyahaktifkan akaun saya, mohon akses dipulihkan dan pengiraan bayaran bagi tempoh penggantungan diberikan. Mohon nombor rujukan untuk tindakan susulan.

Yang benar,  
Kumar a/l Subramaniam · GR-9912

**Read aloud.** “Your six hundred and forty ringgit payment is late. Money for the suspension is still uncertain. Ask Grab when it will pay you and ask for the inquiry decision in writing.”

## 3. Hafiz · An invoice within agreed terms

**Facts for the test.** Hafiz, trading personally as Hafiz Studio Creative, supplied event photography to Lensa Korporat Events Sdn Bhd. For this synthetic Net 30 case use **INV-2026-088-N30** to distinguish it from the earlier seven-day test. The client received the RM2,800 invoice on **16 November 2026**. The written clause specifies 30 calendar days after receipt. Payments and credits at 28 November are zero.

**Step 5.** Due **16 December**. At 28 November the unpaid balance is **RM2,800**, overdue **RM0**, with **18 days remaining**. A client payment run or a delivery timestamp alone does not establish the contractual receipt date. If the trigger is missing, ask for it and leave the due date open. Send a schedule check today. Suggest checking receipts on **17 December**, the day after the agreed due date. If RM1,000 has cleared by then, the overdue balance is **RM1,800**. Full payment closes the case. Record disputed amounts or agreed credits separately.

**Evidence and escalation.** Keep the agreement, invoice, receipt confirmation, delivery record, payment ledger and client replies. Prepare a formal reminder only once the unpaid balance is overdue. Before proposing Act 872 conciliation, establish personal contracting status, citizenship or permanent residence, scheduled service or platform coverage and the applicable complaint process. A trade name alone cannot establish those facts. For an ordinary civil debt outside that route, an eligible individual with a claim up to RM5,000 may consider the Magistrates’ Court small claims procedure and Form 198. A corporate claimant requires a different route. [Gig Workers Act, definitions, Schedule and ss.11, 17–19](https://www.mohr.gov.my/aktapekerjagig2025/assets/documents/Act%20872.pdf) · [Judiciary small claims guide](https://selangor.kehakiman.gov.my/sites/default/files/2024-10/PDF%20Tuntutan%20Kecil.pdf)

**Email to client accounts on 28 November**  
**Subject — Payment schedule for INV-2026-088-N30**

Dear Lensa Korporat Accounts Team,

Could you confirm that my RM2,800 event photography invoice, INV-2026-088-N30, is scheduled for payment on 16 December? Your team received it on 16 November and our agreement provides 30 days from receipt. Please let me know if you need the invoice or delivery details again.

Thank you,  
Hafiz · Hafiz Studio Creative

**WhatsApp on 28 November**  
Hi Lensa Accounts, Hafiz here. Could you confirm that INV-2026-088-N30 for RM2,800 is scheduled for 16 December? Thanks.

**Formal BM letter for the 17 December partial-payment test only**  
Kepada Bahagian Akaun, Lensa Korporat Events Sdn Bhd  
**Permohonan pelunasan baki invois INV-2026-088-N30**

Tuan/Puan,

Invois RM2,800 bagi perkhidmatan fotografi acara telah diterima pada 16 November 2026 dan perlu dibayar pada 16 Disember. Terima kasih atas bayaran RM1,000. Berdasarkan rekod saya pada 17 Disember, baki yang belum dijelaskan ialah RM1,800.

Mohon maklumkan tarikh pembayaran baki tersebut. Sekiranya bayaran tambahan telah dibuat, mohon berikan rujukan transaksi supaya saya dapat mengemas kini rekod.

Yang benar,  
Hafiz · Hafiz Studio Creative

**Read aloud on 28 November.** “Your invoice is due on sixteen December. Nothing is late today. You can ask Accounts to confirm the payment date.”

## 4. Encik Razak · Budi’s payroll and a shop lease

**Payroll facts.** Kopi & Roti Warisan Sdn Bhd is checking its November payroll before release. Budi Santoso is a foreign baker with a valid work pass, a non-permanent resident covered by KWSP Part F and eligible for PERKESO Category 1. Basic RM1,751, no allowances, RM151.53 recorded for 12 hours of ordinary OT. The draft payroll records RM0 employee and employer EPF, RM0 employee PERKESO and RM24.40 employer PERKESO. Registration and category are explicit test inputs. Ask if absent.

**Step 5 payroll.** KWSP excludes ordinary overtime. RM1,751 × 2% = RM35.02, rounded up to **RM36 each** for employee and employer. For the PERKESO table, the recorded gross is RM1,902.53. The June 2026 Category 1 row above RM1,900 through RM2,000 gives **RM34.15 employer**, **RM9.75 employee + RM14.65 employee Lindung = RM24.40 employee**. Total PERKESO RM58.55. Relative to this draft, correct the employer PERKESO by RM9.75 and employee PERKESO by RM24.40. Reconcile OT separately if the recorded amount changes, then select the band again. [KWSP Part F worked example](https://www.kwsp.gov.my/en/employer/responsibilities/non-malaysian-citizen-employees) · [KWSP overtime exclusion](https://www.kwsp.gov.my/en/employer/responsibilities/option-contribute) · [PERKESO June 2026 table, Appendix 1](https://www.perkeso.gov.my/images/lindung/lindung-24-jam/SoalanLazimFormatTeksFail_BM.pdf) · [PERKESO foreign worker eligibility](https://www.perkeso.gov.my/perkhidmatan-kami/perlindungan/pekerja-asing.html)

**Lease facts and calculation.** Separate instrument executed in Malaysia on **14 October 2026**. One-year shop lease at RM4,500/month, no premium or other consideration, one qualifying duplicate, no prior duty paid. At 28 November, 45 days have elapsed. Annual rent RM54,000 gives 216 blocks of RM250. Under Item 49(a), one year gives **RM216 principal**. Add **RM10** for the qualifying duplicate. For the original instrument the first late tier is the higher of RM50 and 10% of RM216, giving **RM50**. **RM276 is the estimate assuming one assessed penalty**. Confirm the copy treatment and final assessment with HASiL. If the copy count is unknown, show RM216 principal and ask for the count. The two-year repository preset has RM648 principal plus RM10 copy **before penalties**. An October 2026 instrument falls outside the 2023–2025 instrument dates for PKPS 2026. [Stamp Act 1949, Items 34 and 49](https://lom.agc.gov.my/ilims/upload/portal/akta/outputaktap/3345938_BI/Act%20378%20%28online%202026%29.pdf) · [HASiL penalty rules](https://www.hasil.gov.my/en/duti-setem/penalti-duti-setem/) · [HASiL tenancy return](https://stamps.hasil.gov.my/stamps/files/announcement/1766953180.pdf) · [PKPS eligibility](https://www.hasil.gov.my/media/ph0foa2w/soalan-lazim-faq-pengecualian-penalti-program-pengakuan-khas-sukarela-pkps-duti-setem-2026.pdf)

**Action and tracking.** Correct the draft before payroll release, explain both employee contributions to Budi and retain the approved register and remittance receipts. Confirm any unresolved registration or contribution questions with KWSP or PERKESO. Submit the lease details through HASiL and save the assessment, payment receipt and stamp certificate. On **30 November**, check separately whether payroll was approved and the lease assessment obtained. This is a suggested internal check. The lease’s statutory stamping window is already past.

**Email to payroll and accounts**  
**Subject — November payroll correction for Budi and separate October lease assessment**

Dear Payroll and Accounts Team,

Please correct Budi Santoso’s November payroll before release. For RM1,751 of EPF-eligible wages, record RM36 employee EPF and RM36 employer EPF. His recorded wages including ordinary overtime total RM1,902.53 for PERKESO. The applicable row gives RM34.15 employer and RM24.40 employee, including RM14.65 for Lindung 24 Jam. Please return the corrected breakdown for approval.

Separately, please submit our one-year shop lease of 14 October for stamping. The estimate is RM216 principal, RM10 for one qualifying copy and RM50 late penalty on the original. Please confirm the assessed amount and send me the payment reference. Keep this cost in the company’s lease records.

Thank you,  
Encik Razak · Kopi & Roti Warisan Sdn Bhd

**WhatsApp to Budi**  
Hai Budi, untuk gaji November, bahagian KWSP Budi ialah RM36 dan syarikat tambah RM36. Bahagian PERKESO Budi ialah RM24.40, termasuk RM14.65 untuk Lindung 24 Jam. Saya akan tunjukkan pecahannya pada slip gaji. Kalau ada angka yang kurang jelas, kita boleh semak bersama. — Razak

**Formal BM payroll correction request, for a draft still showing the original figures**  
Kepada Bahagian Gaji, Kopi & Roti Warisan Sdn Bhd  
**Permohonan pembetulan rekod caruman November 2026 — Budi Santoso**

Tuan/Puan,

Semakan draf gaji Budi Santoso menunjukkan caruman KWSP pekerja dan majikan masing-masing direkodkan sebagai RM0. Berdasarkan upah tertakluk kepada KWSP sebanyak RM1,751, mohon betulkan kedua-dua bahagian kepada RM36 setiap satu.

Bagi upah PERKESO sebanyak RM1,902.53, mohon betulkan bahagian majikan daripada RM24.40 kepada RM34.15 dan bahagian pekerja daripada RM0 kepada RM24.40. Jumlah pekerja itu merangkumi RM14.65 bagi Lindung 24 Jam. Sila kemukakan pecahan yang dikemas kini sebelum gaji diluluskan supaya kami dapat menerangkannya kepada Budi.

Yang benar,  
Encik Razak

**Read aloud to Budi.** “Your retirement contribution is thirty-six ringgit. The company adds another thirty-six. Your social insurance share is twenty-four ringgit and forty sen. Ask payroll to show you both lines.”

## Acceptance checks for the build

| Check | Pass condition |
|---|---|
| Document reuse | Upload a test record with a known ID, amount and date. The draft reuses them. Missing details prompt a question. A blank upload never fills the form with preset details. |
| Calculations | Backend tests assert each case above, zero and partial payments, missing facts, both lease terms and contributions on each side. All amounts in generated messages and audio come from the same engine result. |
| Editing | Change a request or sign-off before sending. Copy, Gmail and WhatsApp carry the edited text. Reopen the draft to check edits. Opening a composer alone leaves case status at “draft.” |
| Case switching | Switch Kumar → Hafiz → Aina → employer. Check recipient, IDs, dates, amount, greeting, attachment wording and audio state. Each belongs to the selected case. |
| Tracking | Store sent date only after user confirmation. Capture reply, ticket/reference, next reminder, partial payment and balance. Closing the payout leaves a pending suspension open. Closing payroll leaves the lease open. |
| Spoken access | On an actual phone, test BM, English, Mandarin and Cantonese separately. Record device, language, actual provider and what was heard. Test pause, replay, stop and slower speed. Ask a listener to repeat the amount, what remains uncertain and the next action. Label the device voice when live audio fails. If neither source has the requested language, keep the transcript available and explain the missing voice. [ILMU speech documentation](https://docs.ilmu.ai/docs/api/text-to-speech) |

**Owner handoff.** Evan can start with `gigEngine.ts`, `payrollEngine.ts`, `stampDutyEngine.ts`, statutory rules and engine tests. Huien can use the drafts for `/tanya`, the workspace drafting view and speech controls. Agree the shared case fields, confidence states, dates and payment balances before changing the API types or browser bridge. During build week, verify TypeScript, Vitest and the production build on the proposed branch before raising a PR. This research pass exercised the pinned engines and checked example arithmetic. UI, export and real-device playback results remain open.

