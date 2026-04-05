import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";

import { bootstrapProject } from "../src/runtime/bootstrap.js";

test("bootstrapProject initializes config-backed workspace and persistence files", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "hackathon-agent-"));
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
      maxPositionSizeUsd: 200,
      maxPortfolioExposureUsd: 500,
      maxDrawdownPct: 10
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
    }
  };

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");

  const project = await bootstrapProject({ configPath });
  await project.persistence.decisions.append({
    id: "decision-1",
    action: "no-trade"
  });

  const decisionsPath = path.join(project.workspace.recordsDir, "decisions.json");
  const manifestPath = path.join(project.workspace.submissionDir, "manifest.json");
  const metadataPath = path.join(project.workspace.artifactsDir, "agent-metadata.json");

  const storedDecisions = JSON.parse(await readFile(decisionsPath, "utf8"));
  const storedManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const storedMetadata = JSON.parse(await readFile(metadataPath, "utf8"));

  assert.equal(project.config.execution.mode, "simulation");
  assert.equal(project.components.executionAdapter.describe().adapterName, "kraken-cli");
  assert.equal(project.components.strategy.describe().type, "simple-threshold");
  assert.equal(project.components.riskPolicy.describe().maxDrawdownPct, 10);
  assert.equal(storedDecisions.length, 1);
  assert.equal(storedManifest.track, "combined");
  assert.equal(storedMetadata.agentName, "OneDev");
});
