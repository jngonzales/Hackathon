import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";

import { bootstrapProject } from "../src/runtime/bootstrap.js";
import { ExecutionAdapter } from "../src/execution/execution-adapter.js";

async function createProject(customConfig = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "hackathon-agent-cycle-"));
  const configDir = path.join(tempRoot, "config");
  const configPath = path.join(configDir, "app.config.json");
  await mkdir(configDir, { recursive: true });

  const config = {
    agent: {
      name: "OneDev",
      strategyMode: "single-strategy",
      identityRegistry: "erc-8004"
    },
    execution: {
      mode: "simulation",
      adapter: "kraken-cli",
      pollIntervalMs: 60000,
      allowCommandExecution: false,
      commandPath: "kraken-cli"
    },
    strategy: {
      symbol: "BTC/USD",
      buyThresholdPct: -2,
      sellThresholdPct: 2,
      orderSizeUsd: 100
    },
    risk: {
      maxPositionSizeUsd: 250,
      maxPortfolioExposureUsd: 1000,
      maxDrawdownPct: 8
    },
    submission: {
      eventName: "AI Trading Agents",
      track: "combined",
      projectTitle: "OneDev",
      shortDescription: "Demo",
      repoUrl: "",
      demoPlatform: "",
      demoUrl: "",
      media: {
        coverImage: "",
        demoVideo: "",
        presentation: ""
      },
      krakenVerification: {
        apiKey: "",
        accountId: ""
      }
    },
    storage: {
      rootDir: "var"
    },
    ...customConfig
  };

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return bootstrapProject({ configPath });
}

test("strategy loop records no-trade decisions without execution", async () => {
  const project = await createProject();
  const result = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: "BTC/USD",
      priceUsd: 50000,
      change24hPct: 0.5,
      observedAt: "2026-04-05T10:00:00.000Z"
    }
  });

  const decisions = await project.persistence.decisions.read();
  const executions = await project.persistence.executions.read();
  const artifacts = await project.persistence.validationArtifacts.read();

  assert.equal(result.decision.outcome, "no-trade");
  assert.equal(result.execution, null);
  assert.equal(result.artifacts.length, 1);
  assert.equal(result.artifacts[0].artifactType, "no-trade-decision");
  assert.equal(decisions.length, 1);
  assert.equal(executions.length, 0);
  assert.equal(artifacts.length, 1);
});

test("strategy loop rejects trades that fail risk checks and records the rejection", async () => {
  const project = await createProject();
  const result = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: "BTC/USD",
      priceUsd: 50000,
      change24hPct: -4,
      observedAt: "2026-04-05T10:01:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 950,
      availableCapitalUsd: 50,
      currentDrawdownPct: 2
    }
  });

  const executions = await project.persistence.executions.read();
  const artifacts = await project.persistence.validationArtifacts.read();

  assert.equal(result.decision.outcome, "risk-rejected");
  assert.equal(result.execution.status, "rejected");
  assert.match(result.execution.reasons[0], /configured portfolio exposure limit|available capital/i);
  assert.equal(result.artifacts.length, 2);
  assert.equal(result.artifacts[0].artifactType, "rejected-trade");
  assert.equal(result.artifacts[1].artifactType, "completed-execution");
  assert.equal(executions.length, 1);
  assert.equal(artifacts.length, 2);
});

test("strategy loop executes approved simulated trades and persists outcomes", async () => {
  const project = await createProject();
  const result = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: "BTC/USD",
      priceUsd: 50000,
      change24hPct: -3,
      observedAt: "2026-04-05T10:02:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 200,
      availableCapitalUsd: 1000,
      currentDrawdownPct: 1
    }
  });

  const executions = await project.persistence.executions.read();
  const artifacts = await project.persistence.validationArtifacts.read();

  assert.equal(result.decision.outcome, "approved");
  assert.equal(result.execution.status, "filled");
  assert.equal(result.execution.execution.transport, "simulation");
  assert.equal(result.artifacts.length, 2);
  assert.equal(result.artifacts[0].artifactType, "approved-trade");
  assert.equal(result.artifacts[1].artifactType, "completed-execution");
  assert.equal(executions.length, 1);
  assert.equal(artifacts.length, 2);
});

test("paper execution uses the Kraken CLI transport boundary", async () => {
  const calls = [];
  const adapter = new ExecutionAdapter({
    mode: "paper",
    adapterName: "kraken-cli",
    commandPath: "kraken-cli",
    allowCommandExecution: true,
    transport: {
      describe() {
        return { commandPath: "kraken-cli", allowCommandExecution: true };
      },
      async submitOrder({ mode, order }) {
        calls.push({ mode, order });
        return {
          status: "submitted",
          mode,
          transport: "kraken-cli"
        };
      }
    }
  });

  const result = await adapter.submitOrder({
    symbol: "BTC/USD",
    side: "buy",
    type: "market",
    quantity: 0.002,
    notionalUsd: 100,
    referencePriceUsd: 50000
  });

  assert.equal(result.status, "submitted");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].mode, "paper");
  assert.equal(calls[0].order.symbol, "BTC/USD");
});

test("evidence journal exports trust evidence and traces outcomes back to source records", async () => {
  const project = await createProject();
  const result = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: "BTC/USD",
      priceUsd: 50000,
      change24hPct: -3,
      observedAt: "2026-04-05T10:03:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 100,
      availableCapitalUsd: 1000,
      currentDrawdownPct: 1
    }
  });

  const evidenceExport = await project.components.evidenceJournal.exportTrustEvidence();
  const trace = await project.components.evidenceJournal.traceOutcome({
    decisionId: result.decision.id
  });

  assert.ok(evidenceExport.exportedAt);
  assert.equal(evidenceExport.agentMetadata.identityRegistry, "erc-8004");
  assert.ok(evidenceExport.summary.artifactTypes.includes("approved-trade"));
  assert.equal(trace.decision.id, result.decision.id);
  assert.equal(trace.execution.id, result.execution.id);
  assert.equal(trace.artifacts.length, 2);
  assert.equal(trace.agentMetadata.executionMode, "simulation");
});
