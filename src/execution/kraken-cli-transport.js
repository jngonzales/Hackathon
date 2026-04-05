import { defaultCommandRunner } from "./default-command-runner.js";

export class KrakenCliTransport {
  constructor({ commandPath = "kraken-cli", allowCommandExecution = false, commandRunner = defaultCommandRunner } = {}) {
    this.commandPath = commandPath;
    this.allowCommandExecution = allowCommandExecution;
    this.commandRunner = commandRunner;
  }

  describe() {
    return {
      commandPath: this.commandPath,
      allowCommandExecution: this.allowCommandExecution
    };
  }

  buildCommand({ mode, order }) {
    const args = [
      "order",
      "create",
      "--symbol",
      order.symbol,
      "--side",
      order.side,
      "--type",
      order.type,
      "--quantity",
      String(order.quantity)
    ];

    if (mode === "paper") {
      args.push("--paper");
    }

    return {
      command: this.commandPath,
      args
    };
  }

  async submitOrder({ mode, order }) {
    const preview = this.buildCommand({ mode, order });

    if (!this.allowCommandExecution) {
      return {
        status: "queued",
        mode,
        transport: "kraken-cli",
        commandPreview: preview,
        message: "Kraken CLI command execution is disabled in configuration."
      };
    }

    try {
      const result = await this.commandRunner(preview.command, preview.args);
      return {
        status: "submitted",
        mode,
        transport: "kraken-cli",
        commandPreview: preview,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      return {
        status: "failed",
        mode,
        transport: "kraken-cli",
        commandPreview: preview,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
