// Step 1–2 of the one-prompt agent: language, case type, facts, follow-up questions.
// Heuristic (works offline / demo / static export). Live mode refines this with ILMU,
// but every number must still appear in the user's own words (see guardFactsAgainstText).

import type {
  AgentCaseType,
  AgentFactKey,
  AgentFacts,
  AgentLanguage,
  AgentQuestion,
} from "./types";

const MS_WORDS =
  /\b(saya|aku|gaji|tak|tidak|bos|majikan|bayar|kerja|akaun|dah|sudah|boleh|apa|macam|mana|kedai|staf|pekerja|invois|klien|bulan|kena|potong|belum|sambilan|hari|jam|sejam|elaun|je|padahal|lagi|dapat|lepas|gantung|purata|sehari|syif)\b/gi;
const EN_WORDS =
  /\b(i|my|me|the|is|was|and|but|boss|pay|paid|salary|hours?|month|day|work|working|client|account|an|this|only|not)\b/gi;

export function detectLanguage(text: string): AgentLanguage {
  if (/[஀-௿]/.test(text)) return "ta";
  if (/[㐀-鿿]/.test(text)) return "zh";
  const ms = text.match(MS_WORDS)?.length ?? 0;
  const en = text.match(EN_WORDS)?.length ?? 0;
  return ms > 0 && ms >= en ? "ms" : "en";
}

const CASE_PATTERNS: [AgentCaseType, RegExp][] = [
  ["sme", /(my staff|staf saya|pekerja saya|payroll|i'?m the employer|saya majikan|my workers|my shop|kedai saya|员工工资|外劳|我的员工|我是老板|ஊதியப் பட்டியல்|என் கடை)/i],
  ["part_time", /(part[- ]?time|sambilan|兼职|兼職|பகுதி நேர|per hour|an hour|sejam|时薪|一小时|\/\s?(hr|hour|jam)\b)/i],
  ["gig_rider", /(rider|grab|panda|lalamove|shopee ?food|suspend|digantung|gantung|deactivat|delivery|penghantaran|骑手|外卖|停号|账号被停|被停|ரைடர்|டெலிவரி|இடைநிறுத்த)/i],
  ["freelancer", /(invoice|invois|client|klien|freelanc|project|projek|发票|客户|接案|விலைப்பட்டியல்|வாடிக்கையாளர்)/i],
  ["employee", /(gaji|salary|payslip|slip|\bot\b|overtime|lebih masa|epf|kwsp|socso|perkeso|lindung|deduct|potong|工资|加班|底薪|சம்பள|கூடுதல் நேர)/i],
];

export function classifyCase(text: string): AgentCaseType | null {
  for (const [type, re] of CASE_PATTERNS) if (re.test(text)) return type;
  return null;
}

const NUM = "([0-9][0-9,]*(?:\\.[0-9]{1,2})?)";
const toNum = (s: string | undefined) => (s === undefined ? undefined : Number(s.replace(/,/g, "")));

/** First number appearing within `gap` characters after any keyword. */
function numAfter(text: string, keywords: string, gap = 28): number | undefined {
  const m = new RegExp(`(?:${keywords})[^0-9\\n]{0,${gap}}?(?:RM|rm|Rm)?\\s?${NUM}`, "i").exec(text);
  return toNum(m?.[1]);
}

/** Number immediately followed by a unit word. */
function numBefore(text: string, units: string): number | undefined {
  const m = new RegExp(`${NUM}\\s*(?:${units})`, "i").exec(text);
  return toNum(m?.[1]);
}

export const OT = "OT|overtime|lebih masa|加班|கூடுதல் நேர";
const HOURS = "jam|hours?|hrs?|h\\b|小时|小時|மணி";
const DAYS = "hari|days?|天|日|நாள்";

export function extractFacts(text: string, caseType: AgentCaseType | null): AgentFacts {
  const f: AgentFacts = {};
  const t = text.replace(/\s+/g, " ");

  if (caseType === "employee") {
    f.basicSalaryRm = numAfter(t, "basic|gaji pokok|gaji asas|底薪|基本工资|அடிப்படை சம்பளம்");
    f.fixedAllowanceRm = numAfter(t, "elaun|allowance|津贴|படி");
    const otHrs =
      new RegExp(`(?:${OT})[^0-9]{0,20}${NUM}\\s*(?:${HOURS})`, "i").exec(t)?.[1] ??
      new RegExp(`${NUM}\\s*(?:${HOURS})\\s*(?:${OT})`, "i").exec(t)?.[1];
    f.otHours = toNum(otHrs);
    f.otPaidRm = numAfter(t, "dapat|dibayar|paid|got|only|cuma|只拿|只给|只有|பெற்ற", 14);
    if (/(lindung|skbbk|24 jam)/i.test(t)) {
      f.optedOutLindung = /(opt[- ]?out|tarik diri|keluar|退出|விலகி)/i.test(t);
      f.lindungDeductedRm = numAfter(t, "lindung 24 jam|lindung|skbbk", 18);
    }
  }

  if (caseType === "part_time") {
    f.hourlyRateRm =
      toNum(new RegExp(`(?:RM)?\\s?${NUM}\\s*(?:\\/\\s*(?:hr|hour|jam)|sejam|per hour|an hour|一小时|每小时)`, "i").exec(t)?.[1]) ??
      numAfter(t, "时薪|hourly|kadar sejam", 8);
    const MONTH = "sebulan|a month|per month|this month|bulan ni|bulan ini|一个月|这个月|这个月份|本月|மாதம்";
    f.hoursThisMonth = toNum(
      new RegExp(`${NUM}\\s*(?:${HOURS})\\s*(?:${MONTH})`, "i").exec(t)?.[1] ??
        new RegExp(`(?:${MONTH})[^0-9]{0,8}${NUM}\\s*(?:${HOURS})`, "i").exec(t)?.[1]
    );
    if (/(bos|boss|老板|majikan|manager)[^.]{0,30}(set|tetap|atur|arrange|编|排|shift|syif|roster)/i.test(t) || /(shift|syif|roster|排班|编更)/i.test(t)) {
      f.bossSetsShifts = true;
    }
  }

  if (caseType === "gig_rider") {
    f.suspensionDays =
      toNum(new RegExp(`(?:gantung|suspend|deactivat|停|இடைநிறுத்த)[^0-9]{0,24}${NUM}\\s*(?:${DAYS})`, "i").exec(t)?.[1]) ??
      toNum(new RegExp(`${NUM}\\s*(?:${DAYS})[^.]{0,20}(?:gantung|suspend|停)`, "i").exec(t)?.[1]);
    f.averageDailyEarningsRm =
      toNum(new RegExp(`(?:RM)\\s?${NUM}\\s*(?:sehari|a day|per day|daily|每天|一天)`, "i").exec(t)?.[1]) ??
      numAfter(t, "purata|average|sehari|a day|每天|一天", 14);
    f.pendingPayoutRm = numAfter(t, "payout|bayaran|tertunggak|pending|belum dapat|未付|还没给|没给", 22);
    f.daysSinceWorkCompleted = toNum(new RegExp(`${NUM}\\s*(?:${DAYS})\\s*(?:lepas|ago|lalu|前)`, "i").exec(t)?.[1]);
  }

  if (caseType === "freelancer") {
    f.invoiceAmountRm = toNum(/RM\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i.exec(t)?.[1]) ?? numAfter(t, "invoice|invois|发票|விலைப்பட்டியல்", 28);
    f.daysSinceWorkCompleted = numBefore(t, DAYS);
    f.hasPaymentTerm = /(net\s?\d+|payment term|tarikh bayar|due date|付款期)/i.test(t) ? true : undefined;
  }

  (Object.keys(f) as (keyof AgentFacts)[]).forEach((k) => f[k] === undefined && delete f[k]);
  return f;
}

/** Live-mode safety: drop any number the model "extracted" that the user never typed. */
export function guardFactsAgainstText(facts: AgentFacts, text: string): AgentFacts {
  const digits = new Set((text.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/g) ?? []).map(Number));
  const out: AgentFacts = {};
  (Object.entries(facts) as [keyof AgentFacts, unknown][]).forEach(([k, v]) => {
    if (typeof v === "number") {
      if (digits.has(v)) (out as Record<string, unknown>)[k] = v;
    } else if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  });
  return out;
}

const REQUIRED: Record<AgentCaseType, AgentFactKey[]> = {
  employee: ["basicSalaryRm"],
  part_time: ["hourlyRateRm", "hoursThisMonth", "bossSetsShifts"],
  gig_rider: ["suspensionDays", "averageDailyEarningsRm"],
  freelancer: ["invoiceAmountRm", "daysSinceWorkCompleted"],
  sme: ["payrollFile"],
};

export function missingFacts(caseType: AgentCaseType | null, facts: AgentFacts, hasPayrollFile = false, mentionsOt = false): AgentFactKey[] {
  if (!caseType) return ["caseType"];
  const req = [...REQUIRED[caseType]];
  if (caseType === "employee" && (mentionsOt || facts.otHours !== undefined || facts.otPaidRm !== undefined)) req.push("otHours", "otPaidRm");
  return req.filter((k) => (k === "payrollFile" ? !hasPayrollFile : (facts as Record<string, unknown>)[k] === undefined));
}

type Q = Record<AgentLanguage, string>;
const QUESTIONS: Partial<Record<AgentFactKey, { kind: AgentQuestion["kind"]; text: Q }>> = {
  basicSalaryRm: { kind: "number", text: { en: "What is the basic salary on your payslip?", ms: "Berapakah gaji pokok dalam slip gaji anda?", zh: "你工资单上的底薪是多少？", ta: "உங்கள் சம்பளச் சீட்டில் அடிப்படை சம்பளம் எவ்வளவு?" } },
  otHours: { kind: "number", text: { en: "How many overtime hours did you work this month?", ms: "Berapa jam kerja lebih masa bulan ini?", zh: "你这个月加班了多少小时？", ta: "இந்த மாதம் எத்தனை மணி நேரம் கூடுதல் வேலை செய்தீர்கள்?" } },
  otPaidRm: { kind: "number", text: { en: "How much overtime pay did you receive?", ms: "Berapa bayaran OT yang anda terima?", zh: "你收到多少加班费？", ta: "எவ்வளவு கூடுதல் நேர ஊதியம் பெற்றீர்கள்?" } },
  hourlyRateRm: { kind: "number", text: { en: "How much are you paid per hour?", ms: "Berapa gaji anda sejam?", zh: "你的时薪是多少？", ta: "ஒரு மணி நேரத்திற்கு எவ்வளவு சம்பளம்?" } },
  hoursThisMonth: { kind: "number", text: { en: "How many hours did you work this month?", ms: "Berapa jam anda bekerja bulan ini?", zh: "你这个月工作了多少小时？", ta: "இந்த மாதம் எத்தனை மணி நேரம் வேலை செய்தீர்கள்?" } },
  bossSetsShifts: { kind: "yes_no", text: { en: "Does your boss set your shifts and tell you how to work?", ms: "Adakah bos tetapkan syif dan cara anda bekerja?", zh: "老板会安排你的班次和工作方式吗？", ta: "உங்கள் ஷிப்ட்களையும் வேலை முறையையும் முதலாளி தீர்மானிக்கிறாரா?" } },
  suspensionDays: { kind: "number", text: { en: "How many days has your account been suspended?", ms: "Sudah berapa hari akaun anda digantung?", zh: "你的账号被停了多少天？", ta: "உங்கள் கணக்கு எத்தனை நாட்களாக இடைநிறுத்தப்பட்டுள்ளது?" } },
  averageDailyEarningsRm: { kind: "number", text: { en: "What were your average daily earnings before the suspension?", ms: "Berapa purata pendapatan sehari sebelum digantung?", zh: "被停号前你平均每天赚多少？", ta: "இடைநிறுத்தத்திற்கு முன் உங்கள் சராசரி தினசரி வருமானம் என்ன?" } },
  invoiceAmountRm: { kind: "number", text: { en: "How much is the unpaid invoice?", ms: "Berapa jumlah invois yang belum dibayar?", zh: "未付款的发票金额是多少？", ta: "செலுத்தப்படாத விலைப்பட்டியல் தொகை எவ்வளவு?" } },
  daysSinceWorkCompleted: { kind: "number", text: { en: "How many days ago did you finish the work?", ms: "Berapa hari lalu kerja itu siap?", zh: "你完成工作多少天了？", ta: "வேலையை முடித்து எத்தனை நாட்கள் ஆகின்றன?" } },
  payrollFile: { kind: "upload", text: { en: "Please upload this month's payroll (spreadsheet or photo).", ms: "Sila muat naik senarai gaji bulan ini (hamparan atau gambar).", zh: "请上传本月的工资表（表格或照片）。", ta: "இந்த மாத ஊதியப் பட்டியலைப் பதிவேற்றவும் (விரிதாள் அல்லது புகைப்படம்)." } },
  caseType: { kind: "choice", text: { en: "So I check the right things: which one is you?", ms: "Supaya saya semak perkara yang betul, anda yang mana?", zh: "为了检查对的项目，请问你是哪一种？", ta: "சரியானதைச் சரிபார்க்க, நீங்கள் யார்?" } },
};

const CASE_LABELS: Record<AgentCaseType, Q> = {
  employee: { en: "Employee", ms: "Pekerja", zh: "员工", ta: "ஊழியர்" },
  part_time: { en: "Part-time", ms: "Kerja sambilan", zh: "兼职", ta: "பகுதி நேரம்" },
  gig_rider: { en: "Gig rider", ms: "Rider gig", zh: "骑手", ta: "கிக் ரைடர்" },
  freelancer: { en: "Freelancer", ms: "Freelancer", zh: "自由职业者", ta: "சுயதொழில் செய்பவர்" },
  sme: { en: "Business owner", ms: "Pemilik perniagaan", zh: "老板", ta: "தொழில் உரிமையாளர்" },
};

export function buildQuestions(keys: AgentFactKey[], lang: AgentLanguage): AgentQuestion[] {
  return keys.flatMap((key) => {
    const q = QUESTIONS[key];
    if (!q) return [];
    const question: AgentQuestion = { key, kind: q.kind, text: q.text[lang] };
    if (key === "caseType") {
      question.options = (Object.keys(CASE_LABELS) as AgentCaseType[]).map((v) => ({ value: v, label: CASE_LABELS[v][lang] }));
    }
    if (q.kind === "yes_no") {
      const yes = { en: "Yes", ms: "Ya", zh: "是", ta: "ஆம்" }[lang];
      const no = { en: "No", ms: "Tidak", zh: "不是", ta: "இல்லை" }[lang];
      question.options = [{ value: "true", label: yes }, { value: "false", label: no }];
    }
    return [question];
  });
}

/** Merge follow-up answers (strings from the UI) into facts. */
export function applyAnswers(facts: AgentFacts, answers: Record<string, unknown> | undefined): AgentFacts {
  if (!answers) return facts;
  const out: AgentFacts = { ...facts };
  for (const [k, raw] of Object.entries(answers)) {
    if (k === "caseType" || k === "payrollFile" || raw === undefined || raw === "") continue;
    if (k === "bossSetsShifts" || k === "optedOutLindung" || k === "hasPaymentTerm") {
      (out as Record<string, unknown>)[k] = raw === true || raw === "true";
    } else if (k === "counterpartyName") {
      out.counterpartyName = String(raw).slice(0, 80);
    } else {
      const n = Number(String(raw).replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n)) (out as Record<string, unknown>)[k] = n;
    }
  }
  return out;
}
