# NightDesk

Overnight agent desk for Bitget tokenized US stocks.

**Author:** [XElvolution](https://github.com/xElvolution)

US cash closes at 21:00 in Lagos. Bitget rTokens do not. Operators across WAT and other remote timezones hold rAAPL, rNVDA, rTSLA, rMSFT, and rAMZN through the gap. NightDesk is the overnight book: import holdings, run the agent cycle, submit one risk-gated rebalance. Every signal ends as a sized action with a receipt.

## Product

1. Import a Bitget holdings CSV (`symbol,qty,avg_price,note`).
2. Research, sentiment, risk, and execution each emit a sized rToken ticket.
3. Submit once. Preview arms for 8 seconds. Anomaly cancels. Fill writes a receipt and updates the ledger.

Hold is an action. Flat still gets a receipt. The desk is not a chatbot.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
npm run build
```

Open [http://localhost:3000/desk](http://localhost:3000/desk). Template CSV: [public/books/holdings.template.csv](public/books/holdings.template.csv).

## Venue

`src/lib/market/venue.ts` selects the adapter:

- **live** - Bitget public spot tickers when reachable
- **recorded** - production-shaped tape with reconnect, rate-limit backoff, and heartbeat errors

Set `NIGHTDESK_FEED=recorded` to force the recorded tape. Missing Bitget keys never show a "demo" mode; the UI reports venue health (`connected` / `reconnecting` / `rate_limited` / `error`).

## Agents

| Agent | Required output |
| --- | --- |
| Research | Bias, confidence, horizon, sized buy / sell / hold |
| Sentiment | Score and heat, confirms or cuts size |
| Risk | 12 hard rules, max qty or block |
| Execution | Preview, cancel-on-anomaly, receipt hash |

A signal that does not close as a sized rAAPL / rNVDA / rTSLA / rMSFT / rAMZN action with a receipt is a bug.

## Risk

Twelve gates: name cap 12%, gross 80%, mega-cap tech cluster 50%, 18 bps spread, 4s quote age, daily loss halt, drawdown brake, earnings blackout (reduce allowed, add blocked), sentiment flip, ADV cap, conviction floor, kill switch.

Table: [docs/RISK-RULES.md](docs/RISK-RULES.md)

## Ledger

- Browser local storage for the operator session
- Server file ledger under `data/ledger/` via `GET/POST /api/ledger`
- Blotter fields: Lagos timestamp, asset, side, price, qty, fee, cash change, receipt id

## Backtest

Overnight path from prior cash close to next open. Fade gaps larger than 1.2%. Follow aligned sentiment otherwise. Cancel on spread blowouts and stale quotes. Engine: `src/lib/backtest/engine.ts`. UI: `/backtest`. API: `GET /api/backtest`.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS 4
- Market adapters (Bitget live + recorded tape)
- Agent orchestration with mandatory receipts
- Risk engine, paper ledger, FNV-1a audit chain
- Node 20+

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product overview and live engine snapshot |
| `/desk` | Import book, run cycle, submit order |
| `/risk` | Twelve rules vs loaded book |
| `/orders` | Armed preview and cancel-on-anomaly |
| `/paper` | Blotter and positions |
| `/audit` | Hash chain |
| `/backtest` | Overnight path replay |

## API

| Path | Methods |
| --- | --- |
| `/api/quotes` | GET |
| `/api/venue` | GET |
| `/api/desk` | GET, POST |
| `/api/holdings` | GET template, POST CSV |
| `/api/rebalance` | GET, POST |
| `/api/risk` | GET, POST |
| `/api/orders/preview` | POST |
| `/api/orders/submit` | POST |
| `/api/paper` | GET |
| `/api/ledger` | GET, POST |
| `/api/audit` | GET |
| `/api/backtest` | GET, POST |

## Repository

```text
nightdesk/
├── src/app/                 # pages + API
├── src/components/          # desk, venue, shell
├── src/lib/market/          # Bitget + recorded adapters
├── src/lib/agents/          # research, sentiment, risk, execution, receipts
├── src/lib/risk/            # twelve hard rules
├── src/lib/ledger/          # server persistence
├── public/books/            # holdings CSV template
├── docs/                    # architecture, risk, hackathon notes
├── data/ledger/             # runtime state (gitignored JSON)
├── LICENSE                  # MIT
└── .env.example
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/RISK-RULES.md](docs/RISK-RULES.md)
- [docs/HACKATHON.md](docs/HACKATHON.md)
- [docs/records/paper-log.json](docs/records/paper-log.json)

Built for Bitget AI Hackathon S2, Agent Trading track.
