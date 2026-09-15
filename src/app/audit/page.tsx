"use client";

import { PageFrame } from "@/components/frame";
import { Panel, Pill } from "@/components/panel";
import { useDesk } from "@/components/desk-context";
import { formatLagos } from "@/lib/clock";

export default function AuditPage() {
  const d = useDesk();
  const events = [...d.audit].reverse();

  return (
    <PageFrame
      kicker="Audit"
      title="Hash-chained desk log"
      lede="Every brief, sentiment print, risk gate, preview, cancel, and paper fill appends to a hash chain. Genesis is the first event. Replay the night from this page or GET /api/audit."
    >
      <Panel>
        <div className="mb-3 flex gap-2">
          <Pill>{d.audit.length} events</Pill>
          <Pill tone="accent">{events[0]?.hash ?? "empty"}</Pill>
        </div>
        {!events.length ? (
          <p className="text-[13px] text-mute">
            Empty chain. Import a book and run a desk cycle. Hold receipts still land here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-faint">
                <tr>
                  {["Lagos", "Actor", "Action", "Name", "Detail", "Hash"].map((h) => (
                    <th key={h} className="pb-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-t border-line align-top">
                    <td className="py-2 tabular text-mute whitespace-nowrap">{formatLagos(e.ts)}</td>
                    <td className="py-2">
                      <Pill tone={e.actor === "execution" ? "accent" : "mute"}>{e.actor}</Pill>
                    </td>
                    <td className="py-2 text-ink">{e.action}</td>
                    <td className="py-2">{e.symbol ?? "desk"}</td>
                    <td className="py-2 max-w-xl text-mute">{e.detail}</td>
                    <td className="py-2 tabular text-accent">{e.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PageFrame>
  );
}
