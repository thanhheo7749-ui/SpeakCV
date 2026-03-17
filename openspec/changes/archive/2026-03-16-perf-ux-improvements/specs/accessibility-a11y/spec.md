## ADDED Requirements

### Requirement: Aria labels on icon buttons
All icon-only buttons SHALL have descriptive `aria-label` attributes.

#### Scenario: Mic button has aria-label
- **WHEN** a screen reader encounters the microphone button
- **THEN** it SHALL announce the button's purpose (e.g., "Bật/tắt micro")

#### Scenario: Hint button has aria-label
- **WHEN** a screen reader encounters the hint (lightbulb) button
- **THEN** it SHALL announce "Gợi ý từ AI"

#### Scenario: Flag/report button has aria-label
- **WHEN** a screen reader encounters the flag/report button
- **THEN** it SHALL announce "Kết thúc và chấm điểm"

### Requirement: Dialog role and focus trap on modals
All modal dialogs SHALL have `role="dialog"`, `aria-modal="true"`, and focus trap.

#### Scenario: Modal has dialog role
- **WHEN** a modal opens
- **THEN** the modal container SHALL have `role="dialog"` and `aria-modal="true"`

#### Scenario: Focus trapped inside modal
- **WHEN** a modal is open and user presses Tab
- **THEN** focus SHALL cycle within the modal's focusable elements only

#### Scenario: Focus restored on close
- **WHEN** a modal closes
- **THEN** focus SHALL return to the element that triggered the modal

### Requirement: Alt text for avatar images
All avatar images SHALL have meaningful `alt` attributes.

#### Scenario: User avatar has alt text
- **WHEN** a user avatar image is rendered
- **THEN** the `alt` attribute SHALL contain the user's name (e.g., "Ảnh đại diện của {userName}")

#### Scenario: Fallback avatar has alt text
- **WHEN** a fallback avatar (ui-avatars) is rendered
- **THEN** the `alt` attribute SHALL still contain meaningful text
