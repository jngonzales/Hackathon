import path from "node:path";
import { readFile } from "node:fs/promises";

const EXECUTION_MODES = new Set(["simulation", "paper", "live"]);
const SUBMISSION_TRACKS = new Set(["kraken", "erc-8004", "combined"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertPositiveNumber(value, label) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean.`);
  }
}

function assertEnum(value, allowed, label) {
  if (!allowed.has(value)) {
    throw new Error(`${label} must be one of: ${Array.from(allowed).join(", ")}.`);
  }
}

export async function loadAppConfig(options = {}) {
  const configPath = path.resolve(options.configPath ?? "config/app.config.json");
  const rawConfig = JSON.parse(await readFile(configPath, "utf8"));

  assertObject(rawConfig, "App config");
  assertObject(rawConfig.agent, "agent");
  assertObject(rawConfig.execution, "execution");
  assertObject(rawConfig.strategy, "strategy");
  assertObject(rawConfig.risk, "risk");
  assertObject(rawConfig.submission, "submission");
  assertObject(rawConfig.submission.media, "submission.media");
  assertObject(rawConfig.submission.hackathonCompliance ?? {}, "submission.hackathonCompliance");
  assertObject(rawConfig.submission.hackathonCompliance?.earlySurge ?? {}, "submission.hackathonCompliance.earlySurge");
  assertObject(rawConfig.submission.hackathonCompliance?.kraken ?? {}, "submission.hackathonCompliance.kraken");
  assertObject(rawConfig.submission.hackathonCompliance?.erc8004 ?? {}, "submission.hackathonCompliance.erc8004");
  assertObject(rawConfig.submission.krakenVerification, "submission.krakenVerification");
  assertObject(rawConfig.storage, "storage");

  if (!isNonEmptyString(rawConfig.agent.name)) {
    throw new Error("agent.name is required.");
  }

  assertEnum(rawConfig.execution.mode, EXECUTION_MODES, "execution.mode");
  if (!isNonEmptyString(rawConfig.execution.adapter)) {
    throw new Error("execution.adapter is required.");
  }
  assertPositiveNumber(rawConfig.execution.pollIntervalMs, "execution.pollIntervalMs");
  assertBoolean(rawConfig.execution.allowCommandExecution, "execution.allowCommandExecution");
  if (!isNonEmptyString(rawConfig.execution.commandPath)) {
    throw new Error("execution.commandPath is required.");
  }
  if (!isNonEmptyString(rawConfig.strategy.symbol)) {
    throw new Error("strategy.symbol is required.");
  }
  assertPositiveNumber(rawConfig.strategy.orderSizeUsd, "strategy.orderSizeUsd");
  if (typeof rawConfig.strategy.buyThresholdPct !== "number" || Number.isNaN(rawConfig.strategy.buyThresholdPct)) {
    throw new Error("strategy.buyThresholdPct must be a number.");
  }
  if (typeof rawConfig.strategy.sellThresholdPct !== "number" || Number.isNaN(rawConfig.strategy.sellThresholdPct)) {
    throw new Error("strategy.sellThresholdPct must be a number.");
  }
  assertPositiveNumber(rawConfig.risk.maxPositionSizeUsd, "risk.maxPositionSizeUsd");
  assertPositiveNumber(rawConfig.risk.maxPortfolioExposureUsd, "risk.maxPortfolioExposureUsd");
  assertPositiveNumber(rawConfig.risk.maxDrawdownPct, "risk.maxDrawdownPct");
  if (!isNonEmptyString(rawConfig.submission.eventName)) {
    throw new Error("submission.eventName is required.");
  }
  if (!isNonEmptyString(rawConfig.submission.projectTitle)) {
    throw new Error("submission.projectTitle is required.");
  }
  assertEnum(rawConfig.submission.track, SUBMISSION_TRACKS, "submission.track");
  if (!isNonEmptyString(rawConfig.storage.rootDir)) {
    throw new Error("storage.rootDir is required.");
  }

  const rootDir = options.storageRootDir
    ? path.resolve(options.storageRootDir)
    : path.resolve(path.dirname(configPath), "..", rawConfig.storage.rootDir);

  return {
    configPath,
    agent: {
      name: rawConfig.agent.name.trim(),
      strategyMode: asOptionalString(rawConfig.agent.strategyMode),
      identityRegistry: asOptionalString(rawConfig.agent.identityRegistry)
    },
    execution: {
      mode: rawConfig.execution.mode,
      adapter: rawConfig.execution.adapter.trim(),
      pollIntervalMs: rawConfig.execution.pollIntervalMs,
      allowCommandExecution: rawConfig.execution.allowCommandExecution,
      commandPath: rawConfig.execution.commandPath.trim()
    },
    strategy: {
      symbol: rawConfig.strategy.symbol.trim(),
      buyThresholdPct: rawConfig.strategy.buyThresholdPct,
      sellThresholdPct: rawConfig.strategy.sellThresholdPct,
      orderSizeUsd: rawConfig.strategy.orderSizeUsd
    },
    risk: {
      maxPositionSizeUsd: rawConfig.risk.maxPositionSizeUsd,
      maxPortfolioExposureUsd: rawConfig.risk.maxPortfolioExposureUsd,
      maxDrawdownPct: rawConfig.risk.maxDrawdownPct
    },
    submission: {
      eventName: rawConfig.submission.eventName.trim(),
      track: rawConfig.submission.track,
      projectTitle: rawConfig.submission.projectTitle.trim(),
      shortDescription: asOptionalString(rawConfig.submission.shortDescription),
      description: asOptionalString(rawConfig.submission.description),
      submissionType: asOptionalString(rawConfig.submission.submissionType),
      categories: asOptionalStringArray(rawConfig.submission.categories),
      tracks: asOptionalStringArray(rawConfig.submission.tracks),
      technologies: asOptionalStringArray(rawConfig.submission.technologies),
      socialMediaPosts: asOptionalStringArray(rawConfig.submission.socialMediaPosts),
      repoUrl: asOptionalString(rawConfig.submission.repoUrl),
      demoPlatform: asOptionalString(rawConfig.submission.demoPlatform),
      demoUrl: asOptionalString(rawConfig.submission.demoUrl),
      additionalInfo: asOptionalString(rawConfig.submission.additionalInfo),
      media: {
        coverImage: asOptionalString(rawConfig.submission.media.coverImage),
        demoVideo: asOptionalString(rawConfig.submission.media.demoVideo),
        presentation: asOptionalString(rawConfig.submission.media.presentation)
      },
      narrative: {
        elevatorPitch: asOptionalString(rawConfig.submission.narrative?.elevatorPitch),
        problemStatement: asOptionalString(rawConfig.submission.narrative?.problemStatement),
        solutionSummary: asOptionalString(rawConfig.submission.narrative?.solutionSummary),
        demoFlow: asOptionalStringArray(rawConfig.submission.narrative?.demoFlow),
        differentiators: asOptionalStringArray(rawConfig.submission.narrative?.differentiators)
      },
      presentation: {
        outline: asOptionalStringArray(rawConfig.submission.presentation?.outline)
      },
      hackathonCompliance: {
        earlySurge: {
          registered: rawConfig.submission.hackathonCompliance?.earlySurge?.registered ?? false,
          projectUrl: asOptionalString(rawConfig.submission.hackathonCompliance?.earlySurge?.projectUrl)
        },
        kraken: {
          buildInPublicLinks: asOptionalStringArray(rawConfig.submission.hackathonCompliance?.kraken?.buildInPublicLinks),
          readOnlyAuditReady: rawConfig.submission.hackathonCompliance?.kraken?.readOnlyAuditReady ?? false
        },
        erc8004: {
          identityRegistered: rawConfig.submission.hackathonCompliance?.erc8004?.identityRegistered ?? false,
          reputationTrackingEnabled: rawConfig.submission.hackathonCompliance?.erc8004?.reputationTrackingEnabled ?? false,
          capitalSandboxEnabled: rawConfig.submission.hackathonCompliance?.erc8004?.capitalSandboxEnabled ?? false,
          riskRouterEnabled: rawConfig.submission.hackathonCompliance?.erc8004?.riskRouterEnabled ?? false
        }
      },
      krakenVerification: {
        apiKey: asOptionalString(rawConfig.submission.krakenVerification.apiKey),
        accountId: asOptionalString(rawConfig.submission.krakenVerification.accountId)
      }
    },
    storage: {
      rootDir,
      recordsDir: path.join(rootDir, "records"),
      artifactsDir: path.join(rootDir, "artifacts"),
      submissionDir: path.join(rootDir, "submission")
    }
  };
}
