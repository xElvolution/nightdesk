# Risk rules

| ID | Name | Severity | Limit |
| --- | --- | --- | --- |
| R01_MAX_NAME | Max name notional | block | 12% of equity |
| R02_GROSS | Gross exposure cap | block | 80% of equity |
| R03_CLUSTER | Mega-cap tech cluster | block | 50% of equity |
| R04_SPREAD | Spread anomaly | block | 18 bps |
| R05_STALE | Quote freshness | block | 4,000 ms |
| R06_DAY_LOSS | Daily loss halt | block | -2.5% of starting cash |
| R07_DRAWDOWN | Drawdown brake | block | 6% from high water |
| R08_EARNINGS | Earnings blackout | block | 16h; reduce allowed |
| R09_SENTIMENT | Sentiment reversal | warn | 40 point flip |
| R10_ADV | ADV participation | block | 1.5% of ADV |
| R11_CONVICTION | Conviction floor | block | conf >= 0.42, \|sent\| >= 18 (alpha only) |
| R12_KILL | Kill switch | block | boolean |

Source of truth: `src/lib/risk/rules.ts` and `src/lib/risk/engine.ts`.
