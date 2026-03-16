## ADDED Requirements

### Requirement: Global keyboard shortcuts
The system SHALL support keyboard shortcuts for power users on the interview page.

#### Scenario: Space toggles microphone
- **WHEN** user presses Space key AND no input/textarea is focused
- **THEN** the microphone SHALL toggle on/off

#### Scenario: Ctrl+N starts new interview
- **WHEN** user presses Ctrl+N (or Cmd+N on Mac)
- **THEN** a new interview session SHALL start (equivalent to clicking "Phỏng vấn mới")

#### Scenario: Ctrl+R opens report
- **WHEN** user presses Ctrl+R (or Cmd+R on Mac)
- **THEN** the report modal SHALL open (equivalent to clicking "Chấm điểm")

#### Scenario: Ctrl+, opens settings
- **WHEN** user presses Ctrl+, (or Cmd+, on Mac)
- **THEN** the settings modal SHALL open

#### Scenario: Esc closes any open modal
- **WHEN** user presses Esc AND a modal is open
- **THEN** the topmost modal SHALL close

#### Scenario: Shortcuts disabled during text input
- **WHEN** user is typing in a textarea or input field
- **THEN** keyboard shortcuts (except Esc) SHALL NOT be triggered
