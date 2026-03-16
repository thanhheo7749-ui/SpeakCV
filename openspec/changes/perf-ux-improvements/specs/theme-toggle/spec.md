## ADDED Requirements

### Requirement: Dark and Light theme support
The system SHALL support toggling between dark and light color themes.

#### Scenario: Theme toggle UI
- **WHEN** user clicks the theme toggle button (sun/moon icon)
- **THEN** the entire app SHALL switch between dark and light mode immediately

#### Scenario: Theme persistence
- **WHEN** user selects a theme preference
- **THEN** the preference SHALL be saved to localStorage and restored on next visit

#### Scenario: Default theme
- **WHEN** user visits the app for the first time (no saved preference)
- **THEN** the app SHALL default to dark mode

#### Scenario: CSS variables for theming
- **WHEN** the theme changes
- **THEN** all themed components SHALL update via CSS custom properties on the `html[data-theme]` attribute

#### Scenario: Theme toggle button location
- **WHEN** user looks for the theme toggle
- **THEN** a sun/moon icon button SHALL be visible in the sidebar settings area
