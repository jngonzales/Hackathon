import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";

import { bootstrapProject } from "../src/runtime/bootstrap.js";

async function createProject(customSubmission = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "hackathon-submission-"));
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
      shortDescription: "Solo AI trading agent using Kraken CLI and ERC-8004 validation artifacts.",
      description: "Detailed project summary.",
      submissionType: "project",
      categories: [],
      tracks: ["combined"],
      technologies: ["Kraken CLI", "ERC-8004"],
      socialMediaPosts: [],
      repoUrl: "",
      demoPlatform: "",
      demoUrl: "",
      additionalInfo: "",
      media: {
        coverImage: "",
        demoVideo: "",
        presentation: ""
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
          registered: false,
          projectUrl: ""
        },
        kraken: {
          buildInPublicLinks: [],
          readOnlyAuditReady: false
        },
        erc8004: {
          identityRegistered: false,
          reputationTrackingEnabled: false,
          capitalSandboxEnabled: false,
          riskRouterEnabled: false
        }
      },
      krakenVerification: {
        apiKey: "",
        accountId: ""
      },
      ...customSubmission
    },
    storage: {
      rootDir: "var"
    }
  };

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return bootstrapProject({ configPath });
}

test("submission manifest prepares a normalized draft with narrative and presentation sections", async () => {
  const project = await createProject();
  const manifest = await project.components.submissionManifest.read();

  assert.equal(manifest.basicInformation.title, "OneDev");
  assert.equal(manifest.basicInformation.tracks[0], "combined");
  assert.equal(manifest.media.assets.coverImage.status, "missing");
  assert.ok(manifest.narrative.demoFlow.length > 0);
  assert.ok(manifest.presentation.outline.length > 0);
});

test("submission readiness reports missing required fields while keeping Kraken fields optional", async () => {
  const project = await createProject();
  const readiness = await project.components.submissionManifest.evaluateReadiness();

  assert.equal(readiness.ready, false);
  assert.ok(readiness.missingRequired.some((item) => item.path === "application.repoLink"));
  assert.ok(readiness.missingRequired.some((item) => item.path === "media.videoLink"));
  assert.ok(readiness.missingHackathonRequirements.some((item) => item.path === "hackathonCompliance.earlySurge.registered"));
  assert.ok(readiness.missingOptional.some((item) => item.path === "krakenVerification.apiKey"));
});

test("submission readiness becomes ready when required fields and asset links are present", async () => {
  const project = await createProject({
    repoUrl: "https://github.com/example/onedev",
    demoPlatform: "Custom Web App",
    demoUrl: "https://example.com/demo",
    media: {
      coverImage: "https://example.com/cover.png",
      demoVideo: "https://example.com/demo.mp4",
      presentation: "https://example.com/deck.pdf"
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
    }
  });

  await project.components.submissionManifest.prepareDraft();
  const readiness = await project.components.submissionManifest.evaluateReadiness();

  assert.equal(readiness.ready, true);
  assert.equal(readiness.missingRequired.length, 0);
  assert.equal(readiness.missingHackathonRequirements.length, 0);
  assert.ok(readiness.missingOptional.some((item) => item.path === "krakenVerification.apiKey"));
});

test("submission manifest updates asset references and mirrors the deck reference", async () => {
  const project = await createProject();
  await project.components.submissionManifest.setAssetReference("presentation", "https://example.com/deck.pdf");
  const manifest = await project.components.submissionManifest.read();

  assert.equal(manifest.media.presentationLink, "https://example.com/deck.pdf");
  assert.equal(manifest.media.assets.presentation.status, "ready");
  assert.equal(manifest.presentation.deckReference, "https://example.com/deck.pdf");
});
