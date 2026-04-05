import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";

import { bootstrapProject } from "../src/runtime/bootstrap.js";
import { buildVerificationReport } from "../src/verification/build-verification-report.js";

async function createProject(overrides = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "hackathon-verify-"));
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
      description: "Detailed project summary.",
      submissionType: "project",
      categories: [],
      tracks: ["combined"],
      technologies: ["Kraken CLI", "ERC-8004"],
      socialMediaPosts: [],
      repoUrl: "https://github.com/example/onedev",
      demoPlatform: "Custom Web App",
      demoUrl: "https://example.com/demo",
      additionalInfo: "",
      media: {
        coverImage: "https://example.com/cover.png",
        demoVideo: "https://example.com/demo.mp4",
        presentation: "https://example.com/deck.pdf"
      },
      narrative: {
        elevatorPitch: "",
        problemStatement: "",
        solutionSummary: "",
        demoFlow: [],
        differentiators: []
      },
      presentation: {
        outline: []
      },
      hackathonCompliance: {
        earlySurge: {
          registered: true,
          projectUrl: "https://early.surge.xyz/projects/onedev"
        },
        kraken: {
          buildInPublicLinks: ["https://x.com/example/status/1"],
          readOnlyAuditReady: false
        },
        erc8004: {
          identityRegistered: true,
          reputationTrackingEnabled: true,
          capitalSandboxEnabled: true,
          riskRouterEnabled: true
        }
      },
      krakenVerification: {
        apiKey: "",
        accountId: ""
      }
    },
    storage: {
      rootDir: "var"
    },
    ...overrides
  };

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return bootstrapProject({ configPath });
}

test("verification report validates end-to-end simulated flow and readiness summary", async () => {
  const project = await createProject();
  const report = await buildVerificationReport(project);

  assert.equal(report.cycleSummary.approved.outcome, "approved");
  assert.equal(report.cycleSummary.approved.executionStatus, "filled");
  assert.equal(report.cycleSummary.noTrade.outcome, "no-trade");
  assert.equal(report.submissionReadiness.ready, true);
  assert.equal(report.submissionReadiness.missingRequired.length, 0);
  assert.equal(report.submissionReadiness.missingHackathonRequirements.length, 0);
});

test("paper mode validation confirms risk rejection occurs before transport submission", async () => {
  let transportCalled = false;
  const project = await createProject({
    execution: {
      mode: "paper",
      adapter: "kraken-cli",
      pollIntervalMs: 60000,
      allowCommandExecution: true,
      commandPath: "kraken-cli"
    }
  });

  project.components.executionAdapter.transport = {
    describe() {
      return { commandPath: "kraken-cli", allowCommandExecution: true };
    },
    async submitOrder() {
      transportCalled = true;
      return {
        status: "submitted",
        mode: "paper",
        transport: "kraken-cli"
      };
    }
  };

  const result = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: "BTC/USD",
      priceUsd: 50000,
      change24hPct: -4,
      observedAt: "2026-04-05T10:12:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 980,
      availableCapitalUsd: 10,
      currentDrawdownPct: 1
    }
  });

  assert.equal(result.decision.outcome, "risk-rejected");
  assert.equal(result.execution.status, "rejected");
  assert.equal(transportCalled, false);
});
