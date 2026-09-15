import { NextResponse } from "next/server";
import { venueSnapshot } from "@/lib/market/venue";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await venueSnapshot();
  return NextResponse.json(snap.health);
}
