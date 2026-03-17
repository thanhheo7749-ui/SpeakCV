## ADDED Requirements

### Requirement: Stats API endpoint
The system SHALL provide a `GET /api/my-stats` endpoint that returns aggregated interview statistics for the authenticated user.

#### Scenario: User requests their stats
- **WHEN** an authenticated user calls `GET /api/my-stats`
- **THEN** the system SHALL return: total interview count, average score, score history (list of `{score, position, date}`), and score trend (improvement percentage)

#### Scenario: User has no interviews
- **WHEN** an authenticated user with no interview history calls `GET /api/my-stats`
- **THEN** the system SHALL return zero values with empty history array

### Requirement: Dashboard page
The system SHALL provide a `/dashboard` page that displays the user's interview statistics with visual charts.

#### Scenario: Dashboard displays score chart
- **WHEN** a logged-in user navigates to `/dashboard`
- **THEN** the page SHALL display a line chart showing interview scores over time using Recharts

#### Scenario: Dashboard shows summary stats
- **WHEN** a logged-in user navigates to `/dashboard`
- **THEN** the page SHALL display: total interviews, average score, best score, and score trend

#### Scenario: Unauthenticated user
- **WHEN** a guest user navigates to `/dashboard`
- **THEN** the page SHALL redirect to `/login`
