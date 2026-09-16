import { STARTING_CASH } from "../universe";
import { feeOn } from "../agents/execution";
import type { Fill, PaperAccount, Position, Quote, Side, SymbolCode } from "../types";

export function emptyAccount(cash = STARTING_CASH): PaperAccount {
  return {
    cashUsdt: cash,
    equityUsdt: cash,
    realizedPnl: 0,
    unrealizedPnl: 0,
    startingCash: cash,
    positions: [],
    dayPnl: 0,
    highWater: cash,
    drawdownPct: 0,
  };
}

export function markAccount(account: PaperAccount, quotes: Quote[]): PaperAccount {
  const map = new Map(quotes.map((q) => [q.symbol, q]));
  let unreal = 0;
  const positions: Position[] = account.positions.map((p) => {
    const q = map.get(p.symbol);
    const px = q?.mid ?? p.avgPrice;
    const marketValue = p.qty * px;
    const unrealizedPnl = p.qty * (px - p.avgPrice);
    unreal += unrealizedPnl;
    return { ...p, marketValue, unrealizedPnl };
  });
  const equity = account.cashUsdt + positions.reduce((s, p) => s + p.marketValue, 0);
  const highWater = Math.max(account.highWater, equity);
  const drawdownPct = highWater === 0 ? 0 : ((highWater - equity) / highWater) * 100;
  const dayPnl = equity - account.startingCash;
  return {
    ...account,
    positions,
    unrealizedPnl: unreal,
    equityUsdt: equity,
    highWater,
    drawdownPct,
    dayPnl,
  };
}

export function applyFill(account: PaperAccount, fill: Fill): PaperAccount {
  const next = { ...account, positions: account.positions.map((p) => ({ ...p })) };
  const fee = fill.feeUsdt;
  const signed = fill.side === "buy" ? fill.qty : -fill.qty;
  const cost = fill.side === "buy" ? fill.notional + fee : -(fill.notional - fee);
  next.cashUsdt -= cost;

  let pos = next.positions.find((p) => p.symbol === fill.symbol);
  if (!pos) {
    pos = { symbol: fill.symbol, qty: 0, avgPrice: 0, marketValue: 0, unrealizedPnl: 0 };
    next.positions.push(pos);
  }

  const prevQty = pos.qty;
  const newQty = prevQty + signed;
  if (prevQty === 0 || Math.sign(prevQty) === Math.sign(newQty) || newQty === 0) {
    if (Math.sign(prevQty) !== Math.sign(signed) && prevQty !== 0) {
      const closed = Math.min(Math.abs(prevQty), fill.qty);
      const pnl = closed * (fill.price - pos.avgPrice) * Math.sign(prevQty);
      next.realizedPnl += pnl;
      if (newQty === 0) {
        pos.qty = 0;
        pos.avgPrice = 0;
      } else if (Math.sign(newQty) !== Math.sign(prevQty)) {
        pos.qty = newQty;
        pos.avgPrice = fill.price;
      } else {
        pos.qty = newQty;
      }
    } else {
      const absNew = Math.abs(newQty);
      const absPrev = Math.abs(prevQty);
      pos.avgPrice =
        absNew === 0 ? 0 : (pos.avgPrice * absPrev + fill.price * fill.qty) / absNew;
      pos.qty = newQty;
    }
  } else {
    const closed = Math.abs(prevQty);
    const pnl = closed * (fill.price - pos.avgPrice) * Math.sign(prevQty);
    next.realizedPnl += pnl;
    pos.qty = newQty;
    pos.avgPrice = fill.price;
  }

  next.positions = next.positions.filter((p) => p.qty !== 0);
  return next;
}

export function makeFill(args: {
  orderId: string;
  symbol: SymbolCode;
  side: Side;
  qty: number;
  price: number;
  ts: number;
  receiptHash?: string;
  receiptId?: string;
}): Fill {
  const notional = args.qty * args.price;
  return {
    id: `fill_${args.orderId}`,
    orderId: args.orderId,
    symbol: args.symbol,
    side: args.side,
    qty: args.qty,
    price: args.price,
    notional,
    feeUsdt: feeOn(notional),
    ts: args.ts,
    receiptHash: args.receiptHash,
    receiptId: args.receiptId,
  };
}
