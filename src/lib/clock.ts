export function nowMs(): number {
  return Date.now();
}

function zonedMinutes(ts: number, tz: string): { day: number; minutes: number; label: string } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(ts)).map((p) => [p.type, p.value]),
  );
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { day: dayMap[parts.weekday] ?? 0, minutes, label: `${parts.hour}:${parts.minute}:${parts.second}` };
}

export function isUsCashOpen(ts = nowMs()): boolean {
  const ny = zonedMinutes(ts, "America/New_York");
  if (ny.day === 0 || ny.day === 6) return false;
  return ny.minutes >= 9 * 60 + 30 && ny.minutes < 16 * 60;
}

export function sessionLabel(ts = nowMs()): "us-cash-open" | "us-cash-closed" {
  return isUsCashOpen(ts) ? "us-cash-open" : "us-cash-closed";
}

export function formatNy(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    timeZone: "America/New_York",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatLagos(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function clockPair(ts = nowMs()): { lagos: string; ny: string; session: string } {
  return {
    lagos: formatLagos(ts),
    ny: formatNy(ts),
    session: sessionLabel(ts) === "us-cash-open" ? "US cash open" : "US cash closed",
  };
}

export function overnightHours(): number {
  return 17.5;
}

export function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}
