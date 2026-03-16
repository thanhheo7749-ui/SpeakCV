## ADDED Requirements

### Requirement: Guest user sees chat icon but cannot chat
Guest users (not logged in) SHALL see the chat icon but be prompted to log in when they try to open it.

#### Scenario: Guest clicks chat icon
- **WHEN** guest user (no token) clicks the chat icon
- **THEN** a small popup appears with text "Đăng nhập để chat hỗ trợ" and a button linking to `/login`

#### Scenario: Logged-in user opens chat normally
- **WHEN** logged-in user clicks the chat icon
- **THEN** the chat widget opens normally without login prompt
