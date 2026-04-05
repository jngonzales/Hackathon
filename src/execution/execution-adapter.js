import { KrakenCliTransport } from "./kraken-cli-transport.js";

export class ExecutionAdapter {
  constructor({ mode, adapterName, commandPath, allowCommandExecution = false, transport }) {
    this.mode = mode;
    this.adapterName = adapterName;
    this.transport = transport ?? new KrakenCliTransport({
      commandPath,
      allowCommandExecution
    });
  }

  describe() {
    return {
      mode: this.mode,
      adapterName: this.adapterName,
      transport: this.transport.describe()
    };
  }

  async submitOrder(order) {
    if (!order || typeof order !== "object") {
      throw new Error("An order is required for execution.");
    }

    if (this.mode === "simulation") {
      const notionalUsd = Number((order.referencePriceUsd * order.quantity).toFixed(2));
      const feesUsd = Number((notionalUsd * 0.001).toFixed(2));

      return {
        status: "filled",
        mode: this.mode,
        transport: "simulation",
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        executedPriceUsd: order.referencePriceUsd,
        notionalUsd,
        feesUsd
      };
    }

    return this.transport.submitOrder({
      mode: this.mode,
      order
    });
  }
}
