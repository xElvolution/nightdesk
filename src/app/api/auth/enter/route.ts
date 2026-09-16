import { NextResponse } from "next/server";
import { validateEnter, upsertOperator } from "@/lib/operators/store";
import { sessionCookieOptions, signSession } from "@/lib/operators/session";
import { readLedger, replaceLedger } from "@/lib/ledger/store";
import { seedOvernightBook } from "@/lib/operators/seed-book";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    displayName?: string;
    handle?: string;
    email?: string;
  };
  const checked = validateEnter(body);
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.error }, { status: 400 });
  }

  const { operator, created } = await upsertOperator({
    displayName: checked.displayName,
    handle: checked.handle,
    email: checked.email,
  });

  let seeded = false;
  const ledger = await readLedger(operator.id);
  if (!ledger.book) {
    await replaceLedger(seedOvernightBook(operator), operator.id);
    seeded = true;
  }

  const token = signSession({
    operatorId: operator.id,
    handle: operator.handle,
    issuedAt: Date.now(),
  });
  const res = NextResponse.json({
    ok: true,
    created,
    seeded,
    operator: {
      id: operator.id,
      displayName: operator.displayName,
      handle: operator.handle,
      email: operator.email,
      initials: operator.initials,
      lastSeenAt: operator.lastSeenAt,
    },
  });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
