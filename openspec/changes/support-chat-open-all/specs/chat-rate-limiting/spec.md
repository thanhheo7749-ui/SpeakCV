## ADDED Requirements

### Requirement: Free user is limited to 5 messages per day
The system SHALL enforce a daily message limit of 5 for free-plan users when sending support messages.

#### Scenario: Free user sends message within limit
- **WHEN** free user sends a support message and has sent fewer than 5 messages today
- **THEN** message is saved and delivered normally

#### Scenario: Free user exceeds daily limit
- **WHEN** free user sends a support message and has already sent 5 messages today
- **THEN** message is rejected with a 429 status and an error message indicating the limit

#### Scenario: Pro user has no message limit
- **WHEN** pro user sends a support message
- **THEN** message is always saved and delivered regardless of daily count

### Requirement: Quota check endpoint exists
The system SHALL provide a GET endpoint `/api/support/quota/{user_id}` that returns the user's remaining messages for today.

#### Scenario: Free user checks quota
- **WHEN** free user requests their quota
- **THEN** response includes `remaining` count (5 minus today's sent messages) and `limit` (5)

#### Scenario: Pro user checks quota
- **WHEN** pro user requests their quota
- **THEN** response includes `remaining` as -1 (unlimited) and `limit` as -1
