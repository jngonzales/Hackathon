## ADDED Requirements

### Requirement: Project tracks required submission fields
The system SHALL maintain a submission manifest that contains all required project fields needed by the hackathon submission flow.

#### Scenario: Required fields are checked
- **WHEN** submission readiness is evaluated
- **THEN** the system verifies the presence of title, short description, full description, repository link, demo platform, demo URL, and required media references

#### Scenario: Optional Kraken fields are absent
- **WHEN** the project is not providing Kraken verification details
- **THEN** the system marks those fields as optional and does not fail readiness on their absence

### Requirement: Submission assets are linked to the project state
The system SHALL reference the media and presentation assets needed for the final submission and demo review.

#### Scenario: Demo assets are ready
- **WHEN** the project has a cover image, demo video, and presentation link
- **THEN** the system records those asset references in the submission manifest

#### Scenario: Demo assets are incomplete
- **WHEN** any required submission asset is missing
- **THEN** the system reports the manifest as not ready for submission

### Requirement: Readiness checks summarize missing deliverables
The system SHALL provide a readiness result that identifies which required submission items are complete and which still block final submission.

#### Scenario: Submission package is complete
- **WHEN** all required fields and assets are present
- **THEN** the system returns a ready-for-submission status

#### Scenario: Submission package is incomplete
- **WHEN** one or more required fields or assets are missing
- **THEN** the system returns a blocking checklist of missing deliverables
