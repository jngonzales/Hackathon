import path from "node:path";
import { JsonFileStore, JsonListStore } from "./json-file-store.js";
import { buildSubmissionTemplate } from "../submission/build-submission-template.js";

export function createPersistence(workspace, config) {
  const decisions = new JsonListStore(path.join(workspace.recordsDir, "decisions.json"));
  const executions = new JsonListStore(path.join(workspace.recordsDir, "executions.json"));
  const validationArtifacts = new JsonListStore(path.join(workspace.artifactsDir, "validation-artifacts.json"));
  const agentMetadata = new JsonFileStore(path.join(workspace.artifactsDir, "agent-metadata.json"), {
    agentName: config.agent.name,
    strategyMode: config.agent.strategyMode,
    identityRegistry: config.agent.identityRegistry,
    executionMode: config.execution.mode,
    supportedValidationOutputs: [
      "no-trade-decision",
      "approved-trade",
      "rejected-trade",
      "completed-execution"
    ]
  });
  const submissionManifest = new JsonFileStore(
    path.join(workspace.submissionDir, "manifest.json"),
    buildSubmissionTemplate(config)
  );

  return {
    decisions,
    executions,
    validationArtifacts,
    agentMetadata,
    submissionManifest
  };
}
