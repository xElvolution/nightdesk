# Architecture

## Flow

```text
CSV holdings
   -> ledger (browser + data/ledger)
   -> desk cycle
        research -> sentiment -> risk -> execution
   -> action receipt (buy | sell | hold)
   -> order preview (8s, cancel-on-anomaly)
   -> fill + audit hash chain
```

## Market adapters

`MarketAdapter.snapshot()` returns quotes plus `VenueHealth`.

- `bitget.ts` - public Bitget spot tickers; falls over to recorded on HTTP/timeout/429
- `recorded.ts` - continuous tape with reconnect and rate-limit windows
- `venue.ts` - selection policy (`NIGHTDESK_FEED`)

UI components (`VenueStatus`, `Ticker`) never label the feed as a demo. They report mode and status only.

## Agents

`runCycle(symbol)` always returns a `DeskCycle` with a `receipt`. Hold is a first-class sized action (`qty = 0`).

`planRebalance(book)` is the overnight knife: for every lot it runs research, sentiment, risk, and execution, then emits exactly one sized action (de-risk sell, alpha buy/sell, or hold) with a receipt. `bundleHash` seals the full night proof. Submit fills trade legs (or confirms holds) and seals receipts to `filled` / `hold` / `cancelled`.

## Risk

`evaluateRisk` is pure. De-risk legs skip the conviction floor and may reduce inside the earnings window. Adds inside the window are blocked.

## Persistence

- Client: `localStorage` key `nightdesk.ledger.v2`
- Server: `data/ledger/state.json` via `/api/ledger`

## Receipt lock

`stampReceipt` hashes symbol, side/hold, qty, limit, status, and risk verdict. `sealReceipt` re-hashes on fill, hold confirm, or cancel. `bundleReceipts` builds the night proof. Fills carry `receiptHash`. Execution, desk UI, blotter, and audit must surface the hash.
