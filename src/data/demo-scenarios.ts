import {
  GigCaseInput,
  PayrollEmployeeInput,
  StampDutyInput,
  UserPersona,
} from "@/lib/engines/types";

export interface DemoScenario {
  id: string;
  persona: UserPersona;
  titleEn: string;
  titleBm: string;
  subtitleEn: string;
  subtitleBm: string;
  badgeEn: string;
  badgeBm: string;
  voiceTranscriptDemo: string;
  entityName: string;
  counterpartyName: string;
  payrollEmployees?: PayrollEmployeeInput[];
  gigCase?: GigCaseInput;
  stampDuty?: StampDutyInput;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "worker-aina",
    persona: "worker",
    titleEn: "Aina — Retail Supervisor Payslip Check",
    titleBm: "Aina — Semakan Slip Gaji Penyelia Runcit",
    subtitleEn:
      "Basic shown as RM1,650 + RM250 allowance, miscalculated 1.5x OT, and Lindung 24 Jam deducted after opt-out.",
    subtitleBm:
      "Gaji pokok RM1,650 + elaun RM250, kiraan OT 1.5x terkurang, dan potongan Lindung 24 Jam walaupun memilih keluar.",
    badgeEn: "Full-Time Worker",
    badgeBm: "Pekerja Sepenuh Masa",
    voiceTranscriptDemo:
      "Hi Hakku, slip gaji bulan ni tulis basic RM1,650 campur elaun RM250 konon cukup RM1,900, lepas tu saya kerja OT 16 jam tapi dapat RM140 je, dan ada potong Lindung 24 Jam padahal saya dah isi borang opt-out.",
    entityName: "Aina Sofia binti Ahmad",
    counterpartyName: "Seri Mart Trading Sdn Bhd",
    payrollEmployees: [
      {
        id: "emp-aina",
        name: "Aina Sofia binti Ahmad",
        citizenship: "citizen",
        ageGroup: "under_60",
        basicSalaryRm: 1650,
        fixedAllowanceRm: 250,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 16,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: true,
        declaredPayslip: {
          basicPaidRm: 1650,
          allowancePaidRm: 250,
          otPaidRm: 140,
          epfEmployeeDeductedRm: 209,
          epfEmployerContributedRm: 247,
          socsoEmployeeDeductedRm: 9.75,
          socsoEmployerContributedRm: 34.15,
          eisEmployeeDeductedRm: 3.9,
          eisEmployerContributedRm: 3.9,
          lindung24JamDeductedRm: 15.4,
          netPaidRm: 1801.95,
        },
      },
    ],
    stampDuty: {
      instrumentType: "employment_contract",
      monthlyWageOrRentRm: 1700,
      tenancyYears: 1,
      duplicateCopies: 1,
      signedDaysAgo: 20,
      alreadyStamped: false,
    },
  },
  {
    id: "sme-razak",
    persona: "sme",
    titleEn: "Encik Razak — SME Kopitiam & Bakery Pre-Payroll Shield",
    titleBm: "Encik Razak — Perisai Pra-Gaji PKS Kopitiam & Bakeri",
    subtitleEn:
      "5-staff payroll (3 local + 2 foreign workers), checks 2% foreign EPF, Lindung 24 Jam, RM3,800 manager Item 4 & shop-lot Item 49(a) PKPS.",
    subtitleBm:
      "Gaji 5 pekerja (3 tempatan + 2 asing), kesan KWSP 2% pekerja asing, Lindung 24 Jam, kontrak pengurus RM3,800 & sewaan kedai PKPS.",
    badgeEn: "SME Business Owner",
    badgeBm: "Pemilik Perniagaan PKS",
    voiceTranscriptDemo:
      "Tolong semak payroll bulan November kedai kami sebelum bayar gaji. Saya ada 3 staf Malaysia dan 2 tukang masak warga asing, satu kontrak manager RM3,800 belum setem, dan sewa lot kedai RM4,500 sebulan dah tandatangan 45 hari lepas.",
    entityName: "Kopi & Roti Warisan Sdn Bhd",
    counterpartyName: "Lembaga Hasil / KWSP / PERKESO",
    payrollEmployees: [
      {
        id: "emp-1",
        name: "Faridah binti Osman (Store Manager)",
        citizenship: "citizen",
        ageGroup: "under_60",
        basicSalaryRm: 3800,
        fixedAllowanceRm: 300,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 0,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: false,
      },
      {
        id: "emp-2",
        name: "Jason Tan Wei Ming (Senior Barista)",
        citizenship: "citizen",
        ageGroup: "under_60",
        basicSalaryRm: 2100,
        fixedAllowanceRm: 150,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 10,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: true,
      },
      {
        id: "emp-3",
        name: "Siti Nurhaliza (Cashier)",
        citizenship: "citizen",
        ageGroup: "under_60",
        basicSalaryRm: 1700,
        fixedAllowanceRm: 100,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 6,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: true,
      },
      {
        id: "emp-4",
        name: "Budi Santoso (Baker — Foreign Worker)",
        citizenship: "foreign",
        ageGroup: "under_60",
        basicSalaryRm: 1751,
        fixedAllowanceRm: 0,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 12,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: false,
        declaredPayslip: {
          basicPaidRm: 1751,
          allowancePaidRm: 0,
          otPaidRm: 151.53,
          epfEmployeeDeductedRm: 0,
          epfEmployerContributedRm: 0,
          socsoEmployeeDeductedRm: 0,
          socsoEmployerContributedRm: 24.4,
          eisEmployeeDeductedRm: 0,
          eisEmployerContributedRm: 0,
          lindung24JamDeductedRm: 0,
          netPaidRm: 1902.53,
        },
      },
      {
        id: "emp-5",
        name: "Arjun Thapa (Kitchen Helper — Foreign Worker)",
        citizenship: "foreign",
        ageGroup: "under_60",
        basicSalaryRm: 1700,
        fixedAllowanceRm: 100,
        commissionOrBonusRm: 0,
        normalDailyHours: 8,
        normalOtHours: 8,
        restDayHours: 0,
        publicHolidayHours: 0,
        lindung24JamOptOut: false,
      },
    ],
    stampDuty: {
      instrumentType: "tenancy_workspace",
      monthlyWageOrRentRm: 4500,
      tenancyYears: 2,
      duplicateCopies: 1,
      signedDaysAgo: 45,
      alreadyStamped: false,
    },
  },
  {
    id: "freelancer-hafiz",
    persona: "freelancer",
    titleEn: "Hafiz — Freelance Commercial Photographer (Act 872)",
    titleBm: "Hafiz — Jurugambar Bebas Komersial (Akta 872)",
    subtitleEn:
      "RM2,800 client invoice overdue 15 days (Act 872), missing written timeline clause, i-Saraan 20% match & studio lease e-Duti Setem.",
    subtitleBm:
      "Invois klien RM2,800 lewat 15 hari (Akta 872), tiada klausa tempoh bayaran, padanan i-Saraan 20% & duti setem sewa studio.",
    badgeEn: "Freelance Business Owner",
    badgeBm: "Pemilik Perniagaan Bebas",
    voiceTranscriptDemo:
      "Client korporat belum bayar invois shooting RM2,800 dah masuk hari ke-15, agreement WhatsApp je tak ada terma tempoh bayaran. Saya nak semak hak Akta 872, kira caruman i-Saraan dengan duti setem studio RM1,800 sebulan.",
    entityName: "Hafiz Studio Creative (SSM Sole Prop)",
    counterpartyName: "Lensa Korporat Events Sdn Bhd",
    gigCase: {
      workerName: "Muhammad Hafiz bin Zulkifli",
      roleType: "freelance_business",
      platformOrClientName: "Lensa Korporat Events Sdn Bhd",
      hasWrittenAgreement: false,
      statesFeeFormula: true,
      statesPaymentTimeline: false,
      statesSuspensionProcess: false,
      invoiceOrPayoutAmountRm: 2800,
      daysSinceWorkCompleted: 15,
      isSuspended: false,
      suspensionDaysElapsed: 0,
      averageDailyEarningsRm: 250,
      backPayPaidRm: 0,
      platformSkspsDeductedRm: 0,
      monthlyGrossGigIncomeRm: 4200,
      annualISaraanContributedRm: 1800,
    },
    stampDuty: {
      instrumentType: "tenancy_workspace",
      monthlyWageOrRentRm: 1800,
      tenancyYears: 1,
      duplicateCopies: 1,
      signedDaysAgo: 18,
      alreadyStamped: false,
    },
  },
  {
    id: "gig-kumar",
    persona: "freelancer",
    titleEn: "Kumar — P-Hailing Rider Account Review (Act 872)",
    titleBm: "Kumar — Semakan Penggantungan Akaun Rider (Akta 872)",
    subtitleEn:
      "19-day platform suspension exceeding 14-day cap, 50% back-pay calculation, overdue 7-day payout & 1.25% PERKESO Lindung Kendiri check.",
    subtitleBm:
      "Penggantungan 19 hari melebihi had 14 hari, kiraan elaun 50%, bayaran tertunggak >7 hari & semakan PERKESO 1.25%.",
    badgeEn: "Gig Platform Rider",
    badgeBm: "Penunggang Gig",
    voiceTranscriptDemo:
      "Boss, akaun rider saya kena suspend dah 19 hari tak ada keputusan lagi, duit earning minggu lepas RM640 pun sangkut dah 11 hari. Purata sehari saya dapat RM110, macam mana nak tuntut 50% back-pay bawah Akta 872?",
    entityName: "Kumar a/l Subramaniam",
    counterpartyName: "KilatGo Delivery Sdn Bhd",
    gigCase: {
      workerName: "Kumar a/l Subramaniam",
      roleType: "gig_rider",
      platformOrClientName: "KilatGo Delivery Sdn Bhd",
      hasWrittenAgreement: true,
      statesFeeFormula: true,
      statesPaymentTimeline: true,
      statesSuspensionProcess: false,
      invoiceOrPayoutAmountRm: 640,
      daysSinceWorkCompleted: 11,
      isSuspended: true,
      suspensionDaysElapsed: 19,
      averageDailyEarningsRm: 110,
      backPayPaidRm: 0,
      platformSkspsDeductedRm: 34.5,
      monthlyGrossGigIncomeRm: 2760,
      annualISaraanContributedRm: 600,
    },
  },
];
