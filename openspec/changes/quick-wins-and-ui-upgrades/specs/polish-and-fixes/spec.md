## ADDED Requirements

### Requirement: Support chat input has readable styling
The support chat widget input field SHALL have a white or light background with dark text, ensuring readability.

#### Scenario: Input is readable
- **WHEN** user views the support chat input field
- **THEN** the input has a white background (`bg-white`) with dark text (`text-gray-800`), not blue background

### Requirement: Application uses Be Vietnam Pro font
The application SHALL load and apply Be Vietnam Pro font from Google Fonts as the primary font family.

#### Scenario: Font is loaded and applied
- **WHEN** user loads any page of the application
- **THEN** the body text renders in Be Vietnam Pro font family with system-ui fallback

#### Scenario: Font does not cause layout shift
- **WHEN** user loads the page
- **THEN** the font uses `display: swap` strategy to prevent invisible text while loading

### Requirement: SEO metadata is comprehensive
The application layout SHALL include Open Graph and Twitter Card metadata for better social sharing and search engine visibility.

#### Scenario: Open Graph tags are present
- **WHEN** user shares a SpeakCV link on social media
- **THEN** the shared preview shows title "SpeakCV – Phỏng vấn AI & Tạo CV chuyên nghiệp", a descriptive text, and proper og:type

#### Scenario: Meta description is informative
- **WHEN** search engine crawls the page
- **THEN** the meta description contains Vietnamese text describing key features (phỏng vấn AI, chấm điểm, tạo CV)

### Requirement: Chat messages have slide-in animation
Chat messages in the interview room SHALL animate with a subtle slide-in effect when they appear.

#### Scenario: AI message slides in from left
- **WHEN** AI sends a new message in the chat
- **THEN** the message bubble animates in from the left with a fade effect

#### Scenario: User message slides in from right
- **WHEN** user's text appears in the chat
- **THEN** the message bubble animates in from the right with a fade effect
