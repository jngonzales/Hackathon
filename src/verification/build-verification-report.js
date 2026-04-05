export async function buildVerificationReport(project) {
  const approvedCycle = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: project.config.strategy.symbol,
      priceUsd: 50000,
      change24hPct: -3,
      observedAt: "2026-04-05T10:10:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 100,
      availableCapitalUsd: 2000,
      currentDrawdownPct: 1
    }
  });

  const noTradeCycle = await project.components.strategyLoop.runCycle({
    marketSnapshot: {
      symbol: project.config.strategy.symbol,
      priceUsd: 50000,
      change24hPct: 0,
      observedAt: "2026-04-05T10:11:00.000Z"
    },
    portfolio: {
      currentExposureUsd: 100,
      availableCapitalUsd: 2000,
      currentDrawdownPct: 1
    }
  });

  const readiness = await project.components.submissionManifest.evaluateReadiness();
  const trustEvidence = await project.components.evidenceJournal.exportTrustEvidence();
  const trace = await project.components.evidenceJournal.traceOutcome({
    decisionId: approvedCycle.decision.id
  });

  const docsChecklist = [
    {
      requirement: "Real financial function",
      status: approvedCycle.execution?.status ? "pass" : "fail"
    },
    {
      requirement: "AI-driven strategy decision",
      status: approvedCycle.decision?.signal ? "pass" : "fail"
    },
    {
      requirement: "Validation artifacts for actions",
      status: trustEvidence.summary.totalArtifacts > 0 ? "pass" : "fail"
    },
    {
      requirement: "Reviewer traceability",
      status: trace?.artifacts?.length > 0 ? "pass" : "fail"
    },
    {
      requirement: "Submission readiness",
      status: readiness.ready ? "pass" : "needs-attention"
    },
    {
      requirement: "Early Surge registration",
      status: readiness.hackathonRequirements.find((item) => item.path === "hackathonCompliance.earlySurge.registered")?.complete
        ? "pass"
        : "needs-attention"
    },
    {
      requirement: "Build in public evidence",
      status: readiness.hackathonRequirements.find((item) => item.path === "hackathonCompliance.kraken.buildInPublicLinks")?.complete
        ? "pass"
        : "needs-attention"
    },
    {
      requirement: "ERC-8004 identity registration",
      status: readiness.hackathonRequirements.find((item) => item.path === "hackathonCompliance.erc8004.identityRegistered")?.complete
        ? "pass"
        : "needs-attention"
    },
    {
      requirement: "Capital sandbox and risk router",
      status: ["hackathonCompliance.erc8004.capitalSandboxEnabled", "hackathonCompliance.erc8004.riskRouterEnabled"].every((path) =>
        readiness.hackathonRequirements.find((item) => item.path === path)?.complete
      )
        ? "pass"
        : "needs-attention"
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    executionMode: project.config.execution.mode,
    cycleSummary: {
      approved: {
        outcome: approvedCycle.decision.outcome,
        executionStatus: approvedCycle.execution?.status ?? null,
        artifactCount: approvedCycle.artifacts.length
      },
      noTrade: {
        outcome: noTradeCycle.decision.outcome,
        artifactCount: noTradeCycle.artifacts.length
      }
    },
    trustEvidenceSummary: trustEvidence.summary,
    submissionReadiness: {
      ready: readiness.ready,
      missingRequired: readiness.missingRequired.map((item) => item.label),
      missingHackathonRequirements: readiness.missingHackathonRequirements.map((item) => item.label)
    },
    docsChecklist
  };
}
