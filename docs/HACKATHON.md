# Bitget AI Hackathon S2 - Agent Trading

**Project:** NightDesk
**Author:** XElvolution
**Track:** Agent Trading (tokenized US stocks)

## Problem

Operators in Lagos and other remote zones hold Bitget rTokens while US cash is closed. Overnight gap, cluster risk, earnings blackouts, and panic fees are the product pain. Commentary is not.

## Solution

A production overnight desk:

- Holdings CSV import and durable ledger
- Four agents that each close with a sized rToken action and receipt
- Twelve hard risk rules including cancel-on-anomaly
- Bitget venue adapter with recorded-tape failover (reconnect, rate limits, errors)
- Blotter, audit hash chain, and overnight backtest with code

## Evidence

- Runnable app: `npm run build && npm run start`
- Paper / fill log: `docs/records/paper-log.json` and `/paper`
- Backtest engine: `src/lib/backtest/engine.ts`
- Risk table: `docs/RISK-RULES.md`

## Submission notes

No login required. Import the CSV template on `/desk`, run a desk cycle, submit the order, inspect `/paper` and `/audit`.
