const refreshButton = document.querySelector("#refresh-report");
const heroReadiness = document.querySelector("#hero-readiness");
const heroSummary = document.querySelector("#hero-summary");
const executionMode = document.querySelector("#execution-mode");
const approvedOutcome = document.querySelector("#approved-outcome");
const approvedStatus = document.querySelector("#approved-status");
const noTradeOutcome = document.querySelector("#no-trade-outcome");
const artifactTotal = document.querySelector("#artifact-total");
const artifactTypes = document.querySelector("#artifact-types");
const missingRequired = document.querySelector("#missing-required");
const missingHackathon = document.querySelector("#missing-hackathon");
const docsChecklist = document.querySelector("#docs-checklist");

function renderList(target, items, emptyLabel) {
  target.innerHTML = "";

  const values = Array.isArray(items) && items.length > 0 ? items : [emptyLabel];

  for (const value of values) {
    const item = document.createElement("li");
    item.textContent = value;
    target.appendChild(item);
  }
}

function renderChecklist(items) {
  docsChecklist.innerHTML = "";

  for (const entry of items) {
    const row = document.createElement("div");
    row.className = `check-row ${entry.status}`;

    const label = document.createElement("span");
    label.textContent = entry.requirement;

    const status = document.createElement("strong");
    status.textContent = entry.status.replace("-", " ");

    row.append(label, status);
    docsChecklist.appendChild(row);
  }
}

function setLoadingState() {
  heroReadiness.textContent = "Loading";
  heroSummary.textContent = "Requesting a fresh verification report from the deployed runtime.";
}

function setErrorState(message) {
  heroReadiness.textContent = "Unavailable";
  heroSummary.textContent = message;
  executionMode.textContent = "Unavailable";
  approvedOutcome.textContent = "Unavailable";
  approvedStatus.textContent = "Unavailable";
  noTradeOutcome.textContent = "Unavailable";
  artifactTotal.textContent = "0";
  renderList(artifactTypes, [], "Verification artifacts could not be loaded.");
  renderList(missingRequired, [], "Readiness report unavailable.");
  renderList(missingHackathon, [], "Compliance report unavailable.");
  renderChecklist([
    {
      requirement: "Verification endpoint",
      status: "needs-attention"
    }
  ]);
}

async function loadReport() {
  setLoadingState();
  refreshButton.disabled = true;
  refreshButton.textContent = "Refreshing...";

  try {
    const response = await fetch("/api/verify", {
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Verification request failed with status ${response.status}.`);
    }

    const report = await response.json();
    const readinessLabel = report.submissionReadiness.ready ? "Ready" : "Needs Attention";

    heroReadiness.textContent = readinessLabel;
    heroSummary.textContent = `Execution mode: ${report.executionMode}. Generated ${new Date(report.generatedAt).toLocaleString()}.`;
    executionMode.textContent = report.executionMode;
    approvedOutcome.textContent = report.cycleSummary.approved.outcome;
    approvedStatus.textContent = report.cycleSummary.approved.executionStatus ?? "n/a";
    noTradeOutcome.textContent = report.cycleSummary.noTrade.outcome;
    artifactTotal.textContent = String(report.trustEvidenceSummary.totalArtifacts);

    renderList(artifactTypes, report.trustEvidenceSummary.artifactTypes, "No validation artifacts were returned.");
    renderList(missingRequired, report.submissionReadiness.missingRequired, "No required-field blockers.");
    renderList(
      missingHackathon,
      report.submissionReadiness.missingHackathonRequirements,
      "No hackathon compliance blockers."
    );
    renderChecklist(report.docsChecklist);
  } catch (error) {
    setErrorState(error instanceof Error ? error.message : "Unknown verification error.");
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh Report";
  }
}

refreshButton.addEventListener("click", () => {
  loadReport();
});

loadReport();
