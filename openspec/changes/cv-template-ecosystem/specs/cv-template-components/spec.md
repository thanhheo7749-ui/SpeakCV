## ADDED Requirements

### Requirement: Teal Sidebar Template
The system SHALL provide a `CVTealSidebar` component that renders a CV with a teal-colored left sidebar (dark teal background, white text) containing Avatar, Contact, Skills, Education — and a white right column with Experience and Projects. The component SHALL accept `cvData: CVData` and `avatarUrl?: string` props. The component SHALL have fixed A4 dimensions (794px × min 1123px) for PDF export.

#### Scenario: Rendering complete CV data
- **WHEN** `CVTealSidebar` receives valid `cvData` with all sections populated
- **THEN** the left sidebar displays avatar, contact info (email, phone, location, linkedin), skills tags, and education entries on a teal (#0d9488) background with white text; the right column displays experience entries with achievements and project entries with tech tags on a white background

#### Scenario: Handling missing optional fields
- **WHEN** `cvData` has empty `skills`, `projects`, or `education` arrays
- **THEN** those sections SHALL be hidden (not rendered) without breaking the layout

#### Scenario: PDF-safe rendering at A4 size
- **WHEN** the component is rendered for print or captured by html2canvas
- **THEN** it SHALL maintain 794px width and proper A4 proportions with `printColorAdjust: exact`

### Requirement: Brown Elegant Template
The system SHALL provide a `CVBrownElegant` component with a large dark brown header containing the candidate's name and position, followed by a two-column body: left column (Skills, Certifications/Intro, Summary) and right column (Experience, Education). The component SHALL accept `cvData: CVData` and `avatarUrl?: string` props with A4 dimensions.

#### Scenario: Rendering complete CV data
- **WHEN** `CVBrownElegant` receives valid `cvData` with all sections populated
- **THEN** the brown (#5D4037) header shows name and title prominently; the body renders skills and summary on the left, experience and education on the right

#### Scenario: PDF-safe rendering
- **WHEN** the component is rendered for print
- **THEN** it SHALL maintain A4 proportions with background colors preserved via `printColorAdjust: exact`

### Requirement: Blue Modern Template
The system SHALL provide a `CVBlueModern` component with a blue left sidebar containing a large avatar, contact info, and skills — and a white right column where section headers (Education, Experience) have a light blue background strip. The component SHALL accept `cvData: CVData` and `avatarUrl?: string` props with A4 dimensions.

#### Scenario: Rendering complete CV data
- **WHEN** `CVBlueModern` receives valid `cvData` with all sections populated
- **THEN** the blue (#1e40af) left sidebar shows avatar, contact details, and skills; the right column shows sections with light blue (#dbeafe) header backgrounds

#### Scenario: Missing avatar fallback
- **WHEN** `avatarUrl` is not provided or fails to load
- **THEN** the component SHALL display a fallback avatar (UI Avatars API or default icon)
