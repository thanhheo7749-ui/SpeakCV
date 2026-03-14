## ADDED Requirements

### Requirement: Save selected theme on handoff to Builder
The system SHALL include the selected template theme in the sessionStorage data when user clicks "Chỉnh sửa thủ công" from Makeover. The saved format SHALL be: `{ data: cvData, theme: selectedTheme }`.

#### Scenario: Handoff with non-default template
- **WHEN** user selects `'teal'` template in Makeover and clicks "Chỉnh sửa thủ công"
- **THEN** sessionStorage `draft_cv_data` contains `{ data: cvData, theme: 'teal' }` and the Builder opens

#### Scenario: Handoff with default template
- **WHEN** user keeps the default template and clicks "Chỉnh sửa thủ công"
- **THEN** sessionStorage `draft_cv_data` contains `{ data: cvData, theme: 'default' }` and the Builder opens

### Requirement: Builder auto-applies theme from Makeover handoff
The system SHALL read the `theme` field from sessionStorage `draft_cv_data` in CV Builder's `useEffect` and automatically set the corresponding template/theme.

#### Scenario: Loading teal theme from Makeover
- **WHEN** Builder opens and sessionStorage contains `{ data: cvData, theme: 'teal' }`
- **THEN** the Builder SHALL call `changeTheme('teal')` and render the Teal Sidebar template preview with the loaded CV data

### Requirement: Live data binding for new templates in Builder
The system SHALL ensure that when user edits form fields in the Builder's left panel, the new template preview on the right updates in real-time.

#### Scenario: Editing name field with teal template active
- **WHEN** user modifies the `full_name` field in the Builder form while the Teal template is active
- **THEN** the name displayed in the Teal template preview SHALL update immediately reflecting the new value

#### Scenario: Adding experience entry with new template active
- **WHEN** user adds a new experience entry via the Builder form while any new template is active
- **THEN** the template preview SHALL immediately show the new experience entry
