import type { PeerOperator } from "./types";

/** Seeded peer roster for ledger fixtures. Not shown in primary desk chrome. */
export function seededPeers(now = Date.now()): PeerOperator[] {
  const m = 60_000;
  const h = 60 * m;
  return [
    {
      id: "peer_ada",
      displayName: "Ada Okonkwo",
      handle: "ada.desk",
      initials: "AO",
      status: "online",
      lastAction: "Armed rNVDA de-risk · 42 lots",
      lastActionAt: now - 4 * m,
      seeded: true,
    },
    {
      id: "peer_marcus",
      displayName: "Marcus Chen",
      handle: "mchen",
      initials: "MC",
      status: "online",
      lastAction: "Risk gate passed on rMSFT add",
      lastActionAt: now - 11 * m,
      seeded: true,
    },
    {
      id: "peer_yara",
      displayName: "Yara Mensah",
      handle: "ymensah",
      initials: "YM",
      status: "away",
      lastAction: "Imported overnight book from Bitget",
      lastActionAt: now - 38 * m,
      seeded: true,
    },
    {
      id: "peer_rio",
      displayName: "Rio Alvarez",
      handle: "rio.a",
      initials: "RA",
      status: "online",
      lastAction: "Cancelled on spread blowout · rTSLA",
      lastActionAt: now - 2 * m,
      seeded: true,
    },
    {
      id: "peer_kenji",
      displayName: "Kenji Watanabe",
      handle: "kwatanabe",
      initials: "KW",
      status: "away",
      lastAction: "Audit replay through cash close",
      lastActionAt: now - 1.4 * h,
      seeded: true,
    },
  ];
}

