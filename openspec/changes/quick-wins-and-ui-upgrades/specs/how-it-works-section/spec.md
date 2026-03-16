## ADDED Requirements

### Requirement: How It Works section displays 3 steps
Landing page SHALL display a "Cách Hoạt Động" section between the Hero and Features sections, showing exactly 3 steps: (1) Nhập JD & vị trí, (2) Phỏng vấn cùng AI, (3) Nhận kết quả & CV.

#### Scenario: Section renders on page load
- **WHEN** user loads the landing page
- **THEN** a "Cách Hoạt Động" section is visible between Hero and Features

#### Scenario: Three steps are displayed horizontally on desktop
- **WHEN** user views the landing page on a desktop viewport (≥768px)
- **THEN** the 3 steps are displayed side-by-side in a horizontal row with connecting lines/arrows

#### Scenario: Steps stack vertically on mobile
- **WHEN** user views the landing page on a mobile viewport (<768px)
- **THEN** the 3 steps are stacked vertically with step numbers visible

### Requirement: Each step has icon, title, and description
Each step in the How It Works section SHALL have a numbered icon, a brief title, and a 1-2 sentence description.

#### Scenario: Step content is complete
- **WHEN** user views any of the 3 steps
- **THEN** each step shows: a numbered circle icon (①②③), a bold title text, and a descriptive paragraph

### Requirement: ScrollReveal animation on steps
Each step SHALL animate into view using the existing ScrollReveal component with staggered delays.

#### Scenario: Steps animate on scroll
- **WHEN** user scrolls to the How It Works section
- **THEN** each step fades in and slides up with progressive delay (0ms, 150ms, 300ms)
