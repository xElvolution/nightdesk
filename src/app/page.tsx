import Link from "next/link";
import { sampleBook } from "@/lib/holdings";
import { planRebalance } from "@/lib/rebalance";
import { RISK_RULES } from "@/lib/risk/rules";
import { usdt, pct } from "@/lib/format";
import { ClockPair } from "@/components/clocks";
import { Metric, Panel, Pill } from "@/components/panel";

export default function Home() {
  const plan = planRebalance(sampleBook());
  const { impact } = plan;

  return (
    <div>
      <section className="grid-fade border-b border-line">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Pill tone="amber">Bitget rToken overnight desk</Pill>
            <ClockPair />
          </div>
          <h1 className="serif mt-8 max-w-4xl text-4xl leading-tight text-ink md:text-6xl">
            US cash closes at 21:00 in Lagos. Your rTokens do not.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-mute">
            Founders and remote teams across Africa hold Apple, NVIDIA, Tesla, Microsoft, and Amazon
            as Bitget rTokens through the night. NightDesk is the overnight book: import holdings,
            run the agent cycle, submit one risk-gated rebalance. Every signal ends as a sized
            action with a receipt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/desk"
              className="rounded-lg bg-amber px-5 py-2.5 text-[13px] font-medium text-bg hover:bg-amber2"
            >
              Open desk
            </Link>
            <a
              href="/books/holdings.template.csv"
              className="rounded-lg border border-line2 px-5 py-2.5 text-[13px] text-ink hover:bg-panel"
            >
              Holdings CSV template
            </a>
            <Link
              href="/risk"
              className="rounded-lg px-5 py-2.5 text-[13px] text-mute hover:text-ink"
            >
              Risk rules
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <Metric
              label="Hours uncovered"
              value={`${impact.hoursSaved}`}
              hint={impact.lagosWatch}
              tone="amber"
            />
          </Panel>
          <Panel>
            <Metric
              label="Fees avoided vs panic"
              value={usdt(impact.feeAvoidedUsdt, 0)}
              hint={`${impact.roundTripsAvoided} round trips vs one gated order`}
              tone="gain"
            />
          </Panel>
          <Panel>
            <Metric
              label="Overnight gap on book"
              value={pct(impact.overnightGapPct)}
              hint={`${usdt(impact.overnightGapUsdt, 0)} on last overnight path`}
              tone="loss"
            />
          </Panel>
          <Panel>
            <Metric
              label="Receipts required"
              value={`${plan.receipts.length}`}
              hint="Buy, sell, or hold. One per name."
            />
          </Panel>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 lg:grid-cols-3">
        <Panel kicker="01" title="Import the Bitget book">
          <p className="text-[13px] leading-6 text-mute">
            CSV of rAAPL, rNVDA, rTSLA, rMSFT, rAMZN plus a USDT sleeve. The ledger stores the book
            on the server and in the browser so the desk resumes where the operator left it.
          </p>
        </Panel>
        <Panel kicker="02" title="Agents size every name">
          <p className="text-[13px] leading-6 text-mute">
            Research, sentiment, risk, and execution each print a sized action. Hold is an action.
            Flat still gets a receipt. Nothing ends as commentary.
          </p>
        </Panel>
        <Panel kicker="03" title="Submit once">
          <p className="text-[13px] leading-6 text-mute">
            Preview arms for 8 seconds. Spread blowout, stale quote, sentiment flip, or kill switch
            cancels before fill. The blotter and hash chain keep the night.
          </p>
        </Panel>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber">Agents</div>
          <h2 className="serif mt-2 text-2xl text-ink">Each one must size the rToken.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Research", "Bias, confidence, catalysts. Output is buy, sell, or hold with a horizon."],
              ["Sentiment", "Overnight heat versus the prior print. Confirms size or cuts it."],
              ["Risk", `${RISK_RULES.length} hard rules. Earnings blackout lets you reduce and forbids adds.`],
              ["Execution", "Stages the ticket, watches the venue, fills or cancels, stamps the receipt."],
            ].map(([name, copy]) => (
              <div key={name} className="rounded-xl border border-line bg-panel p-4">
                <div className="text-[13px] font-medium text-ink">{name}</div>
                <p className="mt-2 text-[12px] leading-5 text-mute">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber">Live engine</div>
              <h2 className="serif mt-2 text-2xl text-ink">Template book under the same gates.</h2>
            </div>
            <Link href="/desk" className="text-[13px] text-amber hover:text-ink">
              Open desk
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-bg2 text-faint">
                <tr>
                  {["Action", "Name", "Status", "Risk", "Notional", "Receipt"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.receipts.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-3 py-2 tabular text-ink">
                      {r.kind.toUpperCase()} {r.qty}
                    </td>
                    <td className="px-3 py-2">{r.symbol}</td>
                    <td className="px-3 py-2 text-mute">{r.status}</td>
                    <td className="px-3 py-2 text-mute">{r.riskVerdict}</td>
                    <td className="px-3 py-2 tabular">{r.notional.toFixed(0)}</td>
                    <td className="px-3 py-2 tabular text-amber">{r.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-faint">{plan.summary}</p>
        </div>
      </section>
    </div>
  );
}
