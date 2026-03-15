## ADDED Requirements

### Requirement: User can tailor CV to a specific Job Description
The system SHALL provide a way for users to optimize their current CV content against a specific Job Description (JD), improving keyword matching and section prioritization for ATS systems.

#### Scenario: User opens the JD Tailor modal from CV Builder
- **WHEN** user clicks the "Tối ưu theo JD" button in the CV Builder header
- **THEN** a modal (TailorJDModal) SHALL open, displaying a textarea for JD input and a submit button

#### Scenario: User submits JD text for tailoring
- **WHEN** user pastes JD content into the textarea and clicks "Tối ưu ngay"
- **THEN** the system SHALL send the current CV data (as JSON) and JD text to the backend API `/api/cv/tailor`
- **AND** the modal SHALL display a loading state with progress indication

#### Scenario: Successful tailoring response
- **WHEN** the backend returns a successfully tailored CV JSON
- **THEN** the system SHALL apply the tailored CV data directly into the CV Builder preview
- **AND** the modal SHALL display a `tailor_summary` explaining what changes were made
- **AND** user can confirm to keep changes or close modal to discard

### Requirement: Backend API processes CV tailoring requests
The system SHALL expose a POST endpoint at `/api/cv/tailor` that accepts the user's current CV in JSON format and a JD text, returning a re-optimized CV JSON.

#### Scenario: Valid tailoring request
- **WHEN** the API receives a valid `CVTailorRequest` with `master_cv_json` (CVMakeoverData format) and `jd_text` (non-empty string)
- **THEN** the API SHALL call the AI service with the tailoring system prompt
- **AND** return a JSON response containing `cv_data` (CVMakeoverData format) and `tailor_summary` (string)

#### Scenario: Empty JD text
- **WHEN** the API receives a request with empty `jd_text`
- **THEN** the API SHALL return HTTP 400 with an error message indicating JD text is required

#### Scenario: JD text exceeds maximum length
- **WHEN** the API receives JD text longer than 5000 characters
- **THEN** the API SHALL truncate the JD text to 5000 characters before processing

### Requirement: AI guardrails prevent hallucination
The AI system prompt SHALL enforce strict guardrails ensuring the tailoring process does NOT fabricate any experience, company, project, or skill that does not exist in the original CV.

#### Scenario: AI reorders experience sections
- **WHEN** the AI processes a CV with multiple experience entries against a JD
- **THEN** the AI SHALL reorder experience items to place the most JD-relevant experiences first
- **AND** all original experience entries MUST be preserved (none added, none removed)

#### Scenario: AI tunes keywords in descriptions
- **WHEN** the AI processes achievement descriptions
- **THEN** the AI SHALL rephrase descriptions to naturally incorporate keywords found in the JD
- **AND** the factual content of each achievement MUST remain truthful to the original

#### Scenario: AI adjusts skills ordering
- **WHEN** the AI processes the skills list
- **THEN** the AI SHALL reorder skills to place JD-matching skills first
- **AND** the AI SHALL NOT add any skill that was not in the original CV

### Requirement: Tailored CV matches existing JSON schema
The tailored CV output MUST conform to the existing `CVMakeoverData` Pydantic model schema used throughout the application.

#### Scenario: Output schema validation
- **WHEN** the AI returns a tailored CV JSON
- **THEN** the backend SHALL validate the response against `CVMakeoverData` model
- **AND** return HTTP 500 if validation fails
