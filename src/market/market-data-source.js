function assertNumber(value, label) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${label} must be a valid number.`);
  }
}

export class MarketDataSource {
  constructor({ defaultSymbol }) {
    this.defaultSymbol = defaultSymbol;
  }

  ingest(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      throw new Error("marketSnapshot must be an object.");
    }

    const symbol = typeof snapshot.symbol === "string" && snapshot.symbol.trim().length > 0
      ? snapshot.symbol.trim()
      : this.defaultSymbol;
    const observedAt = snapshot.observedAt ?? new Date().toISOString();
    const priceUsd = snapshot.priceUsd ?? snapshot.lastPriceUsd;
    const change24hPct = snapshot.change24hPct ?? snapshot.priceChange24hPct ?? 0;

    if (!symbol) {
      throw new Error("A market symbol is required.");
    }

    assertNumber(priceUsd, "marketSnapshot.priceUsd");
    assertNumber(change24hPct, "marketSnapshot.change24hPct");

    return {
      symbol,
      observedAt,
      priceUsd,
      change24hPct,
      bidUsd: snapshot.bidUsd ?? priceUsd,
      askUsd: snapshot.askUsd ?? priceUsd
    };
  }
}
