## ADDED Requirements

### Requirement: Agent evaluates markets through a bounded decision loop
The system SHALL execute trading behavior through a repeatable loop that gathers market inputs, computes strategy signals, evaluates risk, and produces an explicit action decision of buy, sell, or no-trade.

#### Scenario: Strategy produces an actionable decision
- **WHEN** fresh market data is available and the strategy loop runs
- **THEN** the system produces a decision record containing the evaluated inputs, selected action, and strategy rationale

#### Scenario: Strategy elects not to trade
- **WHEN** market conditions do not satisfy the strategy thresholds
- **THEN** the system records a no-trade outcome instead of attempting execution

### Requirement: Execution is mediated by an adapter layer
The system SHALL send trade actions through an execution adapter that supports at least one real trading interface and one non-live execution mode.

#### Scenario: Simulated execution is requested
- **WHEN** the system is configured for non-live execution
- **THEN** the adapter returns a simulated execution result without sending a live order

#### Scenario: Live execution is requested
- **WHEN** the system is configured for live or paper-capable trading and a trade is approved
- **THEN** the adapter submits the order through the configured trading interface and returns the resulting execution status

### Requirement: Risk approval is required before order submission
The system SHALL evaluate every proposed trade against configured risk controls before the execution adapter is invoked.

#### Scenario: Trade passes risk checks
- **WHEN** the proposed order satisfies position, exposure, and drawdown constraints
- **THEN** the system marks the trade as approved for execution

#### Scenario: Trade fails risk checks
- **WHEN** the proposed order breaches any configured risk constraint
- **THEN** the system rejects the trade and records the rejection reason without invoking the execution adapter

### Requirement: Execution outcomes are persisted
The system SHALL persist the result of every approved or rejected trade attempt for later analysis and demo review.

#### Scenario: Order executes successfully
- **WHEN** the execution adapter returns a successful result
- **THEN** the system stores the final order details, timestamps, and resulting position impact

#### Scenario: Order execution fails
- **WHEN** the execution adapter returns an error or rejection
- **THEN** the system stores the failure state and the associated error details
