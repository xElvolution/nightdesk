import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { getOperator, touchOperator } from "@/lib/operators/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, operator: null }, { status: 401 });
  }
  const operator = (await touchOperator(session.operatorId)) ?? (await getOperator(session.operatorId));
  if (!operator) {
    return NextResponse.json({ ok: false, operator: null }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    operator: {
      id: operator.id,
      displayName: operator.displayName,
      handle: operator.handle,
      email: operator.email,
      initials: operator.initials,
      lastSeenAt: operator.lastSeenAt,
    },
  });
}
