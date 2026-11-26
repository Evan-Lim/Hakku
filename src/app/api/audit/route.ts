import { NextRequest, NextResponse } from "next/server";
import { auditEmployeePayroll } from "@/lib/engines/payrollEngine";
import { auditGigCase } from "@/lib/engines/gigEngine";
import { calculateStampDuty2026 } from "@/lib/engines/stampDutyEngine";
import {
  GigCaseInput,
  PayrollEmployeeInput,
  StampDutyInput,
} from "@/lib/engines/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = body?.kind as string;

    if (kind === "payroll") {
      const employees = (body.employees ?? []) as PayrollEmployeeInput[];
      const audits = employees.map(auditEmployeePayroll);
      return NextResponse.json({ kind: "payroll", audits });
    }

    if (kind === "gig") {
      const gigCase = body.gigCase as GigCaseInput;
      return NextResponse.json({ kind: "gig", result: auditGigCase(gigCase) });
    }

    if (kind === "stamp") {
      const stampDuty = body.stampDuty as StampDutyInput;
      return NextResponse.json({
        kind: "stamp",
        result: calculateStampDuty2026(stampDuty),
      });
    }

    return NextResponse.json({ error: "Unsupported audit kind" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Audit computation failed" }, { status: 500 });
  }
}
