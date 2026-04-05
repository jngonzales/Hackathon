## 1. Project Skeleton

- [x] 1.1 Create the initial project structure for the strategy loop, execution adapter, risk policy, evidence journal, and submission manifest
- [x] 1.2 Add configuration handling for execution mode, risk thresholds, and submission metadata
- [x] 1.3 Add a local persistence approach for decision records, execution results, and submission artifacts

## 2. Trading Agent Execution

- [x] 2.1 Implement market data ingestion and a minimal strategy loop that outputs buy, sell, or no-trade decisions
- [x] 2.2 Implement the risk-gating layer for position, exposure, and drawdown checks before execution
- [x] 2.3 Implement a simulated execution adapter that returns deterministic execution outcomes for testing
- [x] 2.4 Integrate the selected trading interface behind the adapter boundary for live or paper-capable execution
- [x] 2.5 Persist approved, rejected, and failed trade outcomes with timestamps and status details

## 3. Trust And Validation

- [x] 3.1 Define the validation artifact schema linking decision inputs, risk checks, and execution outcomes
- [x] 3.2 Generate validation artifacts for no-trade, approved trade, rejected trade, and completed execution flows
- [x] 3.3 Add agent identity and operating-mode metadata export for review and ERC-8004-aligned evidence
- [x] 3.4 Build a reviewer-facing retrieval path that can trace each outcome back to its originating decision record

## 4. Submission Readiness

- [x] 4.1 Create the submission manifest covering title, descriptions, repo link, demo platform, demo URL, and media asset references
- [x] 4.2 Add readiness checks that report missing required fields and missing required assets
- [x] 4.3 Support optional Kraken verification fields without blocking non-Kraken readiness checks
- [x] 4.4 Prepare the final demo assets, project narrative, and presentation references in the manifest

## 5. Verification And Handoff

- [x] 5.1 Validate the full simulated flow from market input to evidence output and readiness status
- [x] 5.2 Validate the live or paper execution path without bypassing risk controls
- [x] 5.3 Review the complete submission checklist against the hackathon docs and close remaining gaps
