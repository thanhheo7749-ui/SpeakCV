## ADDED Requirements

### Requirement: Company question database model
The system SHALL store company interview questions in a `company_questions` table with fields: id, company_name, position, question_text, difficulty, submitted_by (user_id), is_approved (default false), created_at.

#### Scenario: Question submitted by user
- **WHEN** a user submits a question via the API
- **THEN** a new row SHALL be created with `is_approved = false` pending admin review

### Requirement: Submit question API
The system SHALL provide a `POST /api/questions` endpoint for authenticated users to submit interview questions they encountered at real companies.

#### Scenario: Successful submission
- **WHEN** an authenticated user sends a POST with company_name, position, question_text, and difficulty
- **THEN** the system SHALL create the question and return a success message

### Requirement: List questions API
The system SHALL provide a `GET /api/questions` endpoint that returns approved questions, filterable by company name.

#### Scenario: Filter by company
- **WHEN** a user calls `GET /api/questions?company=FPT`
- **THEN** the system SHALL return only approved questions where company_name matches "FPT"

#### Scenario: List all approved questions
- **WHEN** a user calls `GET /api/questions` without filters
- **THEN** the system SHALL return all approved questions ordered by most recent

### Requirement: Admin approve questions
The system SHALL provide a `PATCH /api/admin/questions/{id}/approve` endpoint for admins to approve submitted questions.

#### Scenario: Admin approves a question
- **WHEN** an admin calls the approve endpoint
- **THEN** the question's `is_approved` SHALL be set to true

### Requirement: Question bank page
The system SHALL provide a `/questions` page that displays approved questions grouped/filterable by company.

#### Scenario: User views question bank
- **WHEN** a user navigates to `/questions`
- **THEN** the page SHALL display a list of company names with question counts, and allow filtering

#### Scenario: User submits a question
- **WHEN** a logged-in user clicks "Gửi câu hỏi" on the questions page
- **THEN** a form SHALL appear allowing them to enter company name, position, question text, and difficulty level
