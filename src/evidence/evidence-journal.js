import { ValidationArtifactService } from "./validation-artifact-service.js";

export class EvidenceJournal {
  constructor({ decisions, executions, validationArtifacts, agentMetadata }) {
    this.decisions = decisions;
    this.executions = executions;
    this.validationArtifacts = validationArtifacts;
    this.agentMetadata = agentMetadata;
  }

  async recordDecision(record) {
    return this.decisions.append(record);
  }

  async recordExecution(record) {
    return this.executions.append(record);
  }

  async recordArtifact(record) {
    return this.validationArtifacts.append(record);
  }

  async readAgentMetadata() {
    return this.agentMetadata.read();
  }

  async createArtifactsForCycle({ decision, execution }) {
    const agentMetadata = await this.readAgentMetadata();
    const artifactService = new ValidationArtifactService({ agentMetadata });
    const artifacts = artifactService.createArtifacts({ decision, execution });

    for (const artifact of artifacts) {
      await this.recordArtifact(artifact);
    }

    return artifacts;
  }

  async exportTrustEvidence() {
    const [agentMetadata, validationArtifacts] = await Promise.all([
      this.readAgentMetadata(),
      this.validationArtifacts.read()
    ]);

    return {
      exportedAt: new Date().toISOString(),
      agentMetadata,
      validationArtifacts,
      summary: {
        totalArtifacts: validationArtifacts.length,
        artifactTypes: [...new Set(validationArtifacts.map((artifact) => artifact.artifactType))]
      }
    };
  }

  async traceOutcome({ decisionId, executionId }) {
    const [decisions, executions, validationArtifacts, agentMetadata] = await Promise.all([
      this.decisions.read(),
      this.executions.read(),
      this.validationArtifacts.read(),
      this.readAgentMetadata()
    ]);

    const decision = decisionId
      ? decisions.find((record) => record.id === decisionId) ?? null
      : decisions.find((record) => record.id === executions.find((item) => item.id === executionId)?.decisionId) ?? null;

    const execution = executionId
      ? executions.find((record) => record.id === executionId) ?? null
      : executions.find((record) => record.decisionId === decision?.id) ?? null;

    if (!decision && !execution) {
      return null;
    }

    const artifacts = validationArtifacts.filter((artifact) => {
      const subject = artifact.subject ?? {};
      return subject.decisionId === decision?.id || (execution && subject.executionId === execution.id);
    });

    return {
      agentMetadata,
      decision,
      execution,
      artifacts
    };
  }
}
