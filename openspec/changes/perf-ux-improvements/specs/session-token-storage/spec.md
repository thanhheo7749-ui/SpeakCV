## ADDED Requirements

### Requirement: Token stored in sessionStorage
The system SHALL store JWT tokens in `sessionStorage` instead of `localStorage` to reduce XSS attack window.

#### Scenario: User logs in
- **WHEN** user successfully authenticates (email/password or Google)
- **THEN** the token, userName, and userRole SHALL be stored in `sessionStorage`

#### Scenario: Token retrieval for API calls
- **WHEN** any API function needs the auth token
- **THEN** it SHALL read from `sessionStorage` instead of `localStorage`

#### Scenario: User closes browser tab
- **WHEN** the browser tab is closed
- **THEN** the session data (token, userName, userRole) SHALL be automatically cleared by the browser

#### Scenario: User logs out
- **WHEN** user clicks logout
- **THEN** the system SHALL remove token, userName, userRole from `sessionStorage`
