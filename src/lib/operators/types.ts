export type PresenceStatus = "online" | "away" | "offline";

export interface Operator {
  id: string;
  displayName: string;
  handle: string;
  email?: string;
  initials: string;
  createdAt: number;
  lastSeenAt: number;
}

export interface PeerOperator {
  id: string;
  displayName: string;
  handle: string;
  initials: string;
  status: PresenceStatus;
  lastAction: string;
  lastActionAt: number;
  seeded: true;
}

export interface SessionPayload {
  operatorId: string;
  handle: string;
  issuedAt: number;
}
