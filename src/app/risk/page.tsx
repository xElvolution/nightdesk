"use client";

import { PageFrame } from "@/components/frame";
import { Panel, Pill } from "@/components/panel";
import { useDesk } from "@/components/desk-context";
import { RISK_RULES } from "@/lib/risk/rules";
import { EARNINGS_HOURS } from "@/lib/risk/engine";
import { planRebalance } from "@/lib/rebalance";
import { sampleBook } from "@/lib/holdings";

export default function RiskPage() {
  const d = useDesk();
  const plan = d.plan ?? planRebalance(d.book ?? sampleBook());
  const tripped = new Set(
    [...plan.legs, ...plan.blocked].flatMap((l) =>
      l.risk.results.filter((r) => !r.passed).map((r) => r.id),
    ),
  );

  return (
    <PageFrame
      kicker="Risk"
      title="Twelve hard rules"
      lede="The desk does not debate risk. A rule either passes, warns and cuts size, or blocks the ticket. Reducing into an earnings window is allowed. Adding is not."
    >
      <div className="mb-6 flex flex-wrap gap-2 text-[12px]">
        <Pill tone="accent">{RISK_RULES.length} rules</Pill>
        <Pill tone="loss">rTSLA earnings {EARNINGS_HOURS.rTSLA}h</Pill>
        <Pill>{tripped.size} tripped on loaded book</Pill>
      </div>
      <div className="grid gap-3">
        {RISK_RULES.map((rule) => (
          <Panel key={rule.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] tabular text-faint">{rule.id}</div>
                <h2 className="text-[14px] text-ink">{rule.name}</h2>
                <p className="mt-1 max-w-2xl text-[13px] leading-6 text-mute">{rule.summary}</p>
                <p className="mt-1 text-[12px] text-faint">{rule.why}</p>
              </div>
              <div className="text-right">
                <Pill tone={rule.severity === "block" ? "loss" : "warn"}>{rule.severity}</Pill>
                <div className="mt-2 text-[11px] tabular text-mute">{rule.limit}</div>
                <div className="mt-1">
                  <Pill tone={tripped.has(rule.id) ? "loss" : "gain"}>
                    {tripped.has(rule.id) ? "tripped" : "clear"}
                  </Pill>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
