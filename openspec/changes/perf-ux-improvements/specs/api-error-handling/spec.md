## ADDED Requirements

### Requirement: API request wrapper function
The system SHALL provide a shared `apiRequest(url, options)` function that wraps native `fetch`, checks `res.ok`, parses error JSON, and throws a standardized `Error`.

#### Scenario: API returns non-OK status
- **WHEN** an API call returns status code >= 400
- **THEN** the wrapper SHALL parse the response body as JSON, extract `detail` field, and throw `Error` with message `error.detail || HTTP {status}`

#### Scenario: API returns non-JSON error body
- **WHEN** an API call returns non-OK status AND the body is not valid JSON
- **THEN** the wrapper SHALL throw `Error` with message `Unknown error`

#### Scenario: All existing API functions use the wrapper
- **WHEN** any API function (`endInterview`, `getHint`, `transcribeAudio`, `getHistory`, `upgradeToPro`, `generateCV`) is called
- **THEN** it SHALL use `apiRequest` instead of raw `fetch` and its error handling SHALL be consistent with other API functions

#### Scenario: Authenticated requests include token
- **WHEN** an API function requires authentication
- **THEN** the wrapper SHALL support passing `Authorization` header with the current token
