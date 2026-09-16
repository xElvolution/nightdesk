import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fnv1a } from "../hash";
import type { Operator } from "./types";

const DIR = path.join(process.cwd(), "data", "operators");
const INDEX = path.join(DIR, "index.json");

interface OperatorIndex {
  byHandle: Record<string, string>;
  byId: Record<string, Operator>;
}

async function ensure() {
  await mkdir(DIR, { recursive: true });
}

async function readIndex(): Promise<OperatorIndex> {
  await ensure();
  try {
    const raw = await readFile(INDEX, "utf8");
    return JSON.parse(raw) as OperatorIndex;
  } catch {
    return { byHandle: {}, byId: {} };
  }
}

async function writeIndex(idx: OperatorIndex) {
  await ensure();
  await writeFile(INDEX, JSON.stringify(idx, null, 2));
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "OP";
}

function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);
}

export function validateEnter(input: {
  displayName?: string;
  handle?: string;
  email?: string;
}): { ok: true; displayName: string; handle: string; email?: string } | { ok: false; error: string } {
  const displayName = (input.displayName ?? "").trim().replace(/\s+/g, " ");
  const handle = normalizeHandle(input.handle ?? "");
  const email = (input.email ?? "").trim().toLowerCase() || undefined;

  if (displayName.length < 2 || displayName.length > 48) {
    return { ok: false, error: "Display name must be 2 to 48 characters." };
  }
  if (handle.length < 2 || handle.length > 32) {
    return { ok: false, error: "Handle must be 2 to 32 characters (letters, numbers, . _ -)." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Email looks invalid." };
  }
  return { ok: true, displayName, handle, email };
}

export async function getOperator(id: string): Promise<Operator | null> {
  const idx = await readIndex();
  return idx.byId[id] ?? null;
}

export async function getOperatorByHandle(handle: string): Promise<Operator | null> {
  const idx = await readIndex();
  const id = idx.byHandle[normalizeHandle(handle)];
  return id ? idx.byId[id] ?? null : null;
}

export async function upsertOperator(input: {
  displayName: string;
  handle: string;
  email?: string;
}): Promise<{ operator: Operator; created: boolean }> {
  const idx = await readIndex();
  const handle = normalizeHandle(input.handle);
  const existingId = idx.byHandle[handle];
  const now = Date.now();

  if (existingId && idx.byId[existingId]) {
    const prev = idx.byId[existingId];
    const next: Operator = {
      ...prev,
      displayName: input.displayName,
      email: input.email ?? prev.email,
      initials: initialsFrom(input.displayName),
      lastSeenAt: now,
    };
    idx.byId[existingId] = next;
    await writeIndex(idx);
    return { operator: next, created: false };
  }

  const id = `op_${fnv1a(`${handle}.${now}`)}`;
  const operator: Operator = {
    id,
    displayName: input.displayName,
    handle,
    email: input.email,
    initials: initialsFrom(input.displayName),
    createdAt: now,
    lastSeenAt: now,
  };
  idx.byHandle[handle] = id;
  idx.byId[id] = operator;
  await writeIndex(idx);
  return { operator, created: true };
}

export async function touchOperator(id: string): Promise<Operator | null> {
  const idx = await readIndex();
  const op = idx.byId[id];
  if (!op) return null;
  op.lastSeenAt = Date.now();
  idx.byId[id] = op;
  await writeIndex(idx);
  return op;
}

export async function listOperators(): Promise<Operator[]> {
  const idx = await readIndex();
  return Object.values(idx.byId).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}
