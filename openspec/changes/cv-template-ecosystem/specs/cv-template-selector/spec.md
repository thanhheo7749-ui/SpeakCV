## ADDED Requirements

### Requirement: Template selector on Makeover result page
The system SHALL display a template selector UI in the Makeover result phase allowing users to choose between available templates (Default Blue, Teal Sidebar, Brown Elegant, Blue Modern). The selector SHALL be displayed above the CV preview area.

#### Scenario: User switches template
- **WHEN** user clicks on a template option in the selector
- **THEN** the `selectedTheme` state changes and the CV preview immediately re-renders with the chosen template component, using the same `cvData`

#### Scenario: Default template selection
- **WHEN** the Makeover result phase loads for the first time
- **THEN** the `selectedTheme` SHALL default to `'default'` (CVProTemplate)

### Requirement: Template selector on Builder page
The system SHALL include the new templates (Teal, Brown, Blue Modern) in the Builder's theme selection panel alongside existing themes (Nâu, Xanh Rêu, Đen Vàng, Makeover Blue).

#### Scenario: User selects new template in Builder
- **WHEN** user clicks on a new template (teal/brown/blue_modern) in the Builder's theme panel
- **THEN** the CV preview area renders the corresponding template component with current form data mapped to `CVData` format

### Requirement: Dynamic template rendering via component map
The system SHALL use a template map (`Record<string, ComponentType>`) to dynamically render the correct template based on `selectedTheme` value.

#### Scenario: Rendering by theme key
- **WHEN** the rendering system receives a theme key (e.g., `'teal'`)
- **THEN** it SHALL look up the corresponding component in the template map and render it with the current `cvData` and `avatarUrl` props
