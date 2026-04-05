import { randomUUID } from "node:crypto";

function summarizeRisk(risk = null) {
  if (!risk) {
    return null;
  }

  return {
    approved: risk.approved,
    reasons: risk.reasons ?? [],
    metrics: risk.metrics ?? {}
  };
}

function summarizeExecution(execution = null) {
  if (!execution) {
    return null;
  }

  return {
    id: execution.id,
    status: execution.status,
    symbol: execution.symbol,
    side: execution.side,
    quantity: execution.quantity,
    notionalUsd: execution.notionalUsd,
    execution: execution.execution ?? null,
    reasons: execution.reasons ?? []
  };
}

function inferDecisionArtifactType(decision) {
  switch (decision.outcome) {
    case "no-trade":
      return "no-trade-decision";
    case "risk-rejected":
      return "rejected-trade";
    case "approved":
      return "approved-trade";
    default:
      return "decision";
  }
}

function buildBaseArtifact({ agentMetadata, decision, execution, artifactType }) {
  return {
    id: randomUUID(),
    schemaVersion: "1.0",
    artifactType,
    createdAt: new Date().toISOString(),
    subject: {
      decisionId: decision.id,
      executionId: execution?.id ?? null,
      symbol: decision.symbol
    },
    agent: {
      agentName: agentMetadata.agentName,
      strategyMode: agentMetadata.strategyMode,
      identityRegistry: agentMetadata.identityRegistry,
      executionMode: agentMetadata.executionMode,
      supportedValidationOutputs: agentMetadata.supportedValidationOutputs ?? []
    },
    decision: {
      id: decision.id,
      observedAt: decision.observedAt,
      action: decision.action,
      outcome: decision.outcome,
      rationale: decision.rationale,
      signal: decision.signal,
      marketSnapshot: decision.marketSnapshot,
      order: decision.order ?? null,
      risk: summarizeRisk(decision.risk)
    },
    execution: summarizeExecution(execution)
  };
}

export class ValidationArtifactService {
  constructor({ agentMetadata }) {
    this.agentMetadata = agentMetadata;
  }

  createArtifacts({ decision, execution }) {
    const decisionArtifact = buildBaseArtifact({
      agentMetadata: this.agentMetadata,
      decision,
      execution,
      artifactType: inferDecisionArtifactType(decision)
    });

    const artifacts = [decisionArtifact];

    if (execution) {
      artifacts.push({
        ...buildBaseArtifact({
          agentMetadata: this.agentMetadata,
          decision,
          execution,
          artifactType: "completed-execution"
        }),
        parentArtifactId: decisionArtifact.id
      });
    }

    return artifacts;
  }
}
