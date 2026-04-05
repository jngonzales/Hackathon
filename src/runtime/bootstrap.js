import { loadAppConfig } from "../config/load-app-config.js";
import { ensureWorkspace } from "../persistence/workspace.js";
import { createPersistence } from "../persistence/create-persistence.js";
import { EvidenceJournal } from "../evidence/evidence-journal.js";
import { ExecutionAdapter } from "../execution/execution-adapter.js";
import { RiskPolicy } from "../risk/risk-policy.js";
import { StrategyLoop } from "../agent/strategy-loop.js";
import { SubmissionManifest } from "../submission/submission-manifest.js";
import { MarketDataSource } from "../market/market-data-source.js";
import { SimpleThresholdStrategy } from "../strategy/simple-threshold-strategy.js";

export async function bootstrapProject(options = {}) {
  const config = await loadAppConfig(options);
  const workspace = await ensureWorkspace(config.storage);
  const persistence = createPersistence(workspace, config);

  await Promise.all([
    persistence.decisions.initialize(),
    persistence.executions.initialize(),
    persistence.validationArtifacts.initialize(),
    persistence.agentMetadata.initialize(),
    persistence.submissionManifest.initialize()
  ]);

  const executionAdapter = new ExecutionAdapter({
    mode: config.execution.mode,
    adapterName: config.execution.adapter,
    commandPath: config.execution.commandPath,
    allowCommandExecution: config.execution.allowCommandExecution
  });
  const riskPolicy = new RiskPolicy(config.risk);
  const evidenceJournal = new EvidenceJournal(persistence);
  const submissionManifest = new SubmissionManifest(persistence.submissionManifest, config);
  const marketDataSource = new MarketDataSource({
    defaultSymbol: config.strategy.symbol
  });
  const strategy = new SimpleThresholdStrategy(config.strategy);
  const strategyLoop = new StrategyLoop({
    marketDataSource,
    strategy,
    executionAdapter,
    riskPolicy,
    evidenceJournal
  });

  return {
    config,
    workspace,
    persistence,
    components: {
      strategyLoop,
      marketDataSource,
      strategy,
      executionAdapter,
      riskPolicy,
      evidenceJournal,
      submissionManifest
    }
  };
}
