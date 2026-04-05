import { randomUUID } from "node:crypto";

export class StrategyLoop {
  constructor({ marketDataSource, strategy, executionAdapter, riskPolicy, evidenceJournal }) {
    this.marketDataSource = marketDataSource;
    this.strategy = strategy;
    this.executionAdapter = executionAdapter;
    this.riskPolicy = riskPolicy;
    this.evidenceJournal = evidenceJournal;
  }

  describe() {
    return {
      stages: ["market-input", "signal-evaluation", "risk-gating", "execution-or-no-trade", "evidence-capture"],
      strategy: this.strategy.describe()
    };
  }

  async runCycle({ marketSnapshot, portfolio = {} }) {
    const snapshot = this.marketDataSource.ingest(marketSnapshot);
    const evaluation = this.strategy.evaluate(snapshot);

    const decisionRecord = {
      id: randomUUID(),
      observedAt: snapshot.observedAt,
      symbol: snapshot.symbol,
      marketSnapshot: snapshot,
      action: evaluation.action,
      rationale: evaluation.rationale,
      signal: evaluation.signal
    };

    if (evaluation.action === "no-trade") {
      decisionRecord.outcome = "no-trade";
      await this.evidenceJournal.recordDecision(decisionRecord);
      const artifacts = await this.evidenceJournal.createArtifactsForCycle({
        decision: decisionRecord,
        execution: null
      });
      return {
        decision: decisionRecord,
        execution: null,
        artifacts
      };
    }

    const risk = this.riskPolicy.evaluate({
      order: evaluation.order,
      portfolio
    });

    decisionRecord.order = evaluation.order;
    decisionRecord.risk = risk;

    if (!risk.approved) {
      decisionRecord.outcome = "risk-rejected";
      await this.evidenceJournal.recordDecision(decisionRecord);

      const rejectedExecution = {
        id: randomUUID(),
        decisionId: decisionRecord.id,
        observedAt: snapshot.observedAt,
        status: "rejected",
        symbol: evaluation.order.symbol,
        side: evaluation.order.side,
        quantity: evaluation.order.quantity,
        notionalUsd: evaluation.order.notionalUsd,
        reasons: risk.reasons
      };

      await this.evidenceJournal.recordExecution(rejectedExecution);
      const artifacts = await this.evidenceJournal.createArtifactsForCycle({
        decision: decisionRecord,
        execution: rejectedExecution
      });
      return {
        decision: decisionRecord,
        execution: rejectedExecution,
        artifacts
      };
    }

    decisionRecord.outcome = "approved";
    await this.evidenceJournal.recordDecision(decisionRecord);

    const executionResult = await this.executionAdapter.submitOrder(evaluation.order);
    const executionRecord = {
      id: randomUUID(),
      decisionId: decisionRecord.id,
      observedAt: snapshot.observedAt,
      status: executionResult.status,
      symbol: evaluation.order.symbol,
      side: evaluation.order.side,
      quantity: evaluation.order.quantity,
      notionalUsd: evaluation.order.notionalUsd,
      execution: executionResult
    };

    await this.evidenceJournal.recordExecution(executionRecord);
    const artifacts = await this.evidenceJournal.createArtifactsForCycle({
      decision: decisionRecord,
      execution: executionRecord
    });

    return {
      decision: decisionRecord,
      execution: executionRecord,
      artifacts
    };
  }
}
