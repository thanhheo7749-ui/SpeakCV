## ADDED Requirements

### Requirement: History items are grouped by date category
The sidebar SHALL display interview history items grouped under date headers: "Hôm nay", "Hôm qua", "Tuần trước", and "Cũ hơn".

#### Scenario: Items from today are grouped under Hôm nay
- **WHEN** user views the sidebar with interviews created today
- **THEN** those items appear under a "Hôm nay" group header

#### Scenario: Items from yesterday are grouped under Hôm qua
- **WHEN** user views the sidebar with interviews created yesterday
- **THEN** those items appear under a "Hôm qua" group header

#### Scenario: Items from the past 7 days are grouped under Tuần trước
- **WHEN** user views the sidebar with interviews created 2-7 days ago
- **THEN** those items appear under a "Tuần trước" group header

#### Scenario: Older items are grouped under Cũ hơn
- **WHEN** user views the sidebar with interviews created more than 7 days ago
- **THEN** those items appear under a "Cũ hơn" group header

#### Scenario: Empty groups are hidden
- **WHEN** a date category contains no interviews
- **THEN** that group header is not rendered

### Requirement: Group headers are visually distinct
Group headers SHALL be styled as subtle, uppercase, small-text dividers consistent with the existing sidebar design.

#### Scenario: Group header styling
- **WHEN** user views a date group header
- **THEN** it appears as small uppercase text in slate-500 color with tracking-widest, clearly separating groups
