## ADDED Requirements

### Requirement: Auto-reply when no admin is online
The system SHALL send an automatic reply message when a user sends a message and no admin is connected via WebSocket.

#### Scenario: User sends message with no admin online
- **WHEN** user sends a support message and `admin_connections` list is empty
- **THEN** a system message "Admin hiện không online. Chúng tôi sẽ phản hồi sớm nhất khi có mặt!" is automatically created and sent to the user

#### Scenario: Auto-reply is sent only once per session
- **WHEN** user sends multiple messages while admin is offline
- **THEN** only the first message triggers the auto-reply; subsequent messages do not

#### Scenario: Admin is online
- **WHEN** user sends a support message and at least one admin is connected
- **THEN** no auto-reply is generated
