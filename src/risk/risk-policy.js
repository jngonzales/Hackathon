export class RiskPolicy {
  constructor(thresholds) {
    this.thresholds = thresholds;
  }

  describe() {
    return { ...this.thresholds };
  }

  evaluate({ order, portfolio = {} }) {
    if (!order || typeof order !== "object") {
      throw new Error("A trade intent with order details is required.");
    }

    const reasons = [];
    const currentExposureUsd = portfolio.currentExposureUsd ?? 0;
    const currentDrawdownPct = portfolio.currentDrawdownPct ?? 0;
    const availableCapitalUsd = portfolio.availableCapitalUsd ?? Number.POSITIVE_INFINITY;
    const currentPositionQuantity = portfolio.currentPositionQuantity ?? Number.POSITIVE_INFINITY;

    const projectedExposureUsd = order.side === "buy"
      ? currentExposureUsd + order.notionalUsd
      : Math.max(currentExposureUsd - order.notionalUsd, 0);

    if (order.notionalUsd > this.thresholds.maxPositionSizeUsd) {
      reasons.push("order size exceeds the configured max position size");
    }

    if (projectedExposureUsd > this.thresholds.maxPortfolioExposureUsd) {
      reasons.push("projected exposure exceeds the configured portfolio exposure limit");
    }

    if (currentDrawdownPct > this.thresholds.maxDrawdownPct) {
      reasons.push("current drawdown exceeds the configured drawdown limit");
    }

    if (order.side === "buy" && availableCapitalUsd < order.notionalUsd) {
      reasons.push("available capital is lower than the requested order size");
    }

    if (order.side === "sell" && currentPositionQuantity < order.quantity) {
      reasons.push("position size is lower than the requested sell quantity");
    }

    return {
      approved: reasons.length === 0,
      reasons,
      metrics: {
        currentExposureUsd,
        projectedExposureUsd,
        currentDrawdownPct,
        availableCapitalUsd,
        currentPositionQuantity
      }
    };
  }
}
