## Context

This change turns the hackathon source material into an implementation-ready plan for a combined Kraken and ERC-8004 submission. The current repository has no product contract, no architecture, and no definition of done beyond the exported event and submission pages. The design must therefore optimize for fast delivery of a working demo, measurable trading behavior, trust evidence, and a complete submission package.

Key constraints from the docs:
- The project must demonstrate a real financial function, not a static demo.
- Kraken participation requires market-data access, trade execution, and optional read-only verification fields for submission.
- ERC-8004 participation requires identity, reputation-oriented evidence, and validation artifacts tied to agent actions.
- Submission requires project metadata, media assets, repository link, demo platform selection, live demo URL, and optional Kraken audit data.

## Goals / Non-Goals

**Goals:**
- Define a minimal architecture for an autonomous trading agent with bounded execution and explainable outcomes.
- Separate strategy logic from execution and risk controls so the demo can be credible without overfitting to one interface.
- Preserve evidence for every material decision and trade so the project is reviewable and compatible with ERC-8004-oriented trust expectations.
- Treat submission readiness as a first-class capability so the project does not fail on incomplete assets at handoff time.

**Non-Goals:**
- Maximizing raw PnL through a complex or high-frequency strategy.
- Designing on-chain contracts or a full production custody system.
- Supporting multiple exchanges or advanced portfolio management in the first iteration.
- Automating final hackathon judging workflows outside the project’s own evidence and submission package.

## Decisions

### Decision: Use a bounded agent loop with explicit stage transitions
The system will run as a repeatable loop: ingest market data, compute signals, evaluate risk, decide action, execute or skip, then record evidence. This keeps the agent explainable and testable.

Alternative considered:
- Event-driven autonomous actions with looser state management. Rejected because it increases ambiguity and makes audit trails harder to produce under hackathon time pressure.

### Decision: Isolate execution behind a trading adapter
Trading actions will be issued through an adapter boundary so the strategy engine does not depend directly on Kraken CLI internals. This allows simulated execution for demos and safer testing before any live action.

Alternative considered:
- Embedding Kraken-specific commands directly in the strategy loop. Rejected because it couples strategy validation, execution, and testing too tightly.

### Decision: Make risk gating mandatory before every order attempt
Every proposed action must pass configurable limits for position size, max exposure, and drawdown guardrails before execution. A skipped trade is a valid outcome and must be recorded.

Alternative considered:
- Strategy-defined self-policing. Rejected because trust and capital-protection claims are weaker if the same component both proposes and approves trades.

### Decision: Persist a validation journal for trust and review
The project will maintain a structured journal containing decision inputs, selected strategy outputs, risk checks, execution attempts, and resulting outcomes. This journal is the basis for ERC-8004-facing validation artifacts and submission evidence.

Alternative considered:
- Relying on logs alone. Rejected because raw logs are not durable enough as a review artifact and do not naturally map to submission evidence.

### Decision: Maintain a submission manifest alongside the application
Submission data will be treated as a maintained artifact with required fields, asset references, and readiness checks. This reduces the risk of having a working agent but an incomplete submission package.

Alternative considered:
- Collecting submission data manually at the end. Rejected because the submission schema is explicit and failure there is avoidable with earlier structure.

## Risks / Trade-offs

- [Live trading integration instability] -> Mitigation: support simulated or paper execution behind the same adapter and keep live credentials optional.
- [Strategy underperforms during the event window] -> Mitigation: optimize for risk-bounded, explainable behavior and clear evidence rather than aggressive position-taking.
- [ERC-8004 expectations are broader than the exported docs capture] -> Mitigation: store detailed validation artifacts and keep registry/reputation integration points explicit in the design.
- [Submission assets become the critical path] -> Mitigation: define the submission manifest and readiness checklist in parallel with application work.
- [No existing codebase structure] -> Mitigation: keep the first version modular and minimal so implementation can start from a small, coherent skeleton.

## Migration Plan

1. Create the project skeleton for agent loop, adapter layer, risk policy, evidence storage, and submission manifest.
2. Implement simulated execution first and validate the full decision lifecycle.
3. Integrate the chosen trading interface and verify bounded real or paper execution.
4. Add trust and validation outputs needed for review and ERC-8004-aligned evidence.
5. Produce final submission assets, readiness checks, and demo flow before final handoff.

Rollback strategy is simple because no production deployment exists yet: disable live execution, keep simulation mode active, and preserve the evidence journal for debugging.

## Open Questions

- Will the first implementation use live Kraken execution, paper trading, or a local simulation only?
- What exact ERC-8004 registry interactions are expected in-scope for the submission versus described conceptually?
- Which demo platform and hosting path will be used for the live submission URL?
- Does the team want a single strategy or multiple switchable strategies for the demo?

## Answers
- I'm the only one on this project + all your questions must follow strictly what is required in .docs\information.md