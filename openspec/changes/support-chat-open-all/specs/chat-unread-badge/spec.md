## ADDED Requirements

### Requirement: Unread message count endpoint
The system SHALL provide a GET endpoint `/api/support/unread-count/{user_id}` that returns the number of unread messages from admin.

#### Scenario: User has unread admin messages
- **WHEN** user requests unread count and admin has sent 3 unread messages
- **THEN** response includes `unread_count: 3`

#### Scenario: User has no unread messages
- **WHEN** user requests unread count and all messages are read
- **THEN** response includes `unread_count: 0`

### Requirement: Badge displays on chat icon
The frontend chat icon SHALL display a red badge with the unread count when there are unread admin messages.

#### Scenario: Badge shows unread count
- **WHEN** user has unread admin messages and chat widget is closed
- **THEN** a red badge with the count number is visible on the chat icon

#### Scenario: Badge disappears when all read
- **WHEN** user opens chat widget and messages are marked as read
- **THEN** the red badge disappears

### Requirement: Polling occurs at 30-second intervals
The frontend SHALL poll the unread count endpoint every 30 seconds when the widget is closed and the user is logged in.

#### Scenario: Polling stops when widget is open
- **WHEN** user opens the chat widget
- **THEN** polling stops (WebSocket handles real-time updates)

#### Scenario: Polling stops when tab is inactive
- **WHEN** browser tab becomes hidden
- **THEN** polling pauses until tab is visible again
