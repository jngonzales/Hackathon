function roundQuantity(quantity) {
  return Number(quantity.toFixed(8));
}

export class SimpleThresholdStrategy {
  constructor({ symbol, buyThresholdPct, sellThresholdPct, orderSizeUsd }) {
    this.symbol = symbol;
    this.buyThresholdPct = buyThresholdPct;
    this.sellThresholdPct = sellThresholdPct;
    this.orderSizeUsd = orderSizeUsd;
  }

  describe() {
    return {
      type: "simple-threshold",
      symbol: this.symbol,
      buyThresholdPct: this.buyThresholdPct,
      sellThresholdPct: this.sellThresholdPct,
      orderSizeUsd: this.orderSizeUsd
    };
  }

  evaluate(snapshot) {
    if (snapshot.symbol !== this.symbol) {
      return {
        action: "no-trade",
        rationale: `Snapshot symbol ${snapshot.symbol} does not match configured strategy symbol ${this.symbol}.`,
        signal: "symbol-mismatch"
      };
    }

    if (snapshot.change24hPct <= this.buyThresholdPct) {
      return this.#createTradeIntent("buy", snapshot, "price-drawdown-entry");
    }

    if (snapshot.change24hPct >= this.sellThresholdPct) {
      return this.#createTradeIntent("sell", snapshot, "price-strength-exit");
    }

    return {
      action: "no-trade",
      rationale: `24h change ${snapshot.change24hPct}% is between ${this.buyThresholdPct}% and ${this.sellThresholdPct}%.`,
      signal: "within-hold-band"
    };
  }

  #createTradeIntent(side, snapshot, signal) {
    const quantity = roundQuantity(this.orderSizeUsd / snapshot.priceUsd);

    return {
      action: side,
      rationale: `${signal} triggered at ${snapshot.change24hPct}% 24h change.`,
      signal,
      order: {
        symbol: snapshot.symbol,
        side,
        type: "market",
        notionalUsd: this.orderSizeUsd,
        quantity,
        referencePriceUsd: snapshot.priceUsd,
        observedAt: snapshot.observedAt
      }
    };
  }
}
