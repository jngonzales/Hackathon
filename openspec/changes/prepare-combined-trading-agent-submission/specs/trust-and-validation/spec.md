## ADDED Requirements

### Requirement: Agent actions produce validation artifacts
The system SHALL generate a structured validation artifact for each material agent action, including no-trade decisions, approved trades, rejected trades, and completed executions.

#### Scenario: Decision artifact is created
- **WHEN** the agent completes a decision cycle
- **THEN** the system stores an artifact containing decision inputs, chosen action, and rationale

#### Scenario: Execution artifact is created
- **WHEN** a trade attempt completes with success or failure
- **THEN** the system stores an artifact linking the trade decision to its execution outcome

### Requirement: Validation artifacts are reviewable and linked to outcomes
The system SHALL preserve identifiers and references that allow reviewers to trace a trading outcome back to the originating decision and risk evaluation.

#### Scenario: Reviewer inspects a completed trade
- **WHEN** a reviewer opens the evidence for a completed trade
- **THEN** the system provides linked records for the strategy decision, risk approval, execution result, and resulting outcome

#### Scenario: Reviewer inspects a rejected trade
- **WHEN** a reviewer opens the evidence for a rejected trade
- **THEN** the system provides the proposed action and the exact risk or policy reason for rejection

### Requirement: Agent identity and trust metadata are maintained
The system SHALL maintain agent metadata that can be used to describe identity, operating mode, and trust-related properties for the submission.

#### Scenario: Identity metadata is requested
- **WHEN** the project needs to present agent identity or operating characteristics
- **THEN** the system returns a structured metadata record describing the agent, strategy mode, and supported validation outputs

#### Scenario: Trust evidence is exported
- **WHEN** the project prepares ERC-8004-aligned evidence for review
- **THEN** the system exports the current identity and validation metadata in a structured form
