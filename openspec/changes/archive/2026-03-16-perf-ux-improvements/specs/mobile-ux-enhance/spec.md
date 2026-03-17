## ADDED Requirements

### Requirement: Mobile hint modal swipe to dismiss
The hint popup on mobile SHALL support swipe-down gesture to close.

#### Scenario: User swipes down on hint modal
- **WHEN** user swipes down on the mobile hint modal
- **THEN** the modal SHALL close with a slide-down animation

#### Scenario: User taps backdrop to close
- **WHEN** user taps the backdrop area of the mobile hint modal
- **THEN** the modal SHALL still close (existing behavior preserved)

### Requirement: Chat box scroll into view on mobile
The chat box input area SHALL scroll into view when the mobile keyboard opens.

#### Scenario: User focuses chat textarea on mobile
- **WHEN** user taps the chat textarea on a mobile device and the virtual keyboard opens
- **THEN** the textarea SHALL scroll into view so it is not hidden behind the keyboard
