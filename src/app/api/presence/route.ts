import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { getOperator, listOperators } from "@/lib/operators/store";
import { seededPeers } from "@/lib/operators/peers";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();
  const session = await readSession();
  const peers = seededPeers(now);
  const operators = await listOperators();

  const recent = operators
    .filter((o) => !session || o.id !== session.operatorId)
    .slice(0, 4)
    .map((o) => ({
      id: o.id,
      displayName: o.displayName,
      handle: o.handle,
      initials: o.initials,
      status: now - o.lastSeenAt < 15 * 60_000 ? ("online" as const) : ("away" as const),
      lastAction: "On desk",
      lastActionAt: o.lastSeenAt,
      seeded: false as const,
    }));

  let self = null as null | {
    id: string;
    displayName: string;
    handle: string;
    initials: string;
    status: "online";
    lastAction: string;
    lastActionAt: number;
    seeded: false;
  };
  if (session) {
    const op = await getOperator(session.operatorId);
    if (op) {
      self = {
        id: op.id,
        displayName: op.displayName,
        handle: op.handle,
        initials: op.initials,
        status: "online",
        lastAction: "You · active on desk",
        lastActionAt: op.lastSeenAt,
        seeded: false,
      };
    }
  }

  const strip = [...(self ? [self] : []), ...recent, ...peers].slice(0, 8);
  const onlineCount = strip.filter((p) => p.status === "online").length;

  return NextResponse.json({
    now,
    onlineCount,
    operatorsOnDesk: strip.length,
    strip,
  });
}
