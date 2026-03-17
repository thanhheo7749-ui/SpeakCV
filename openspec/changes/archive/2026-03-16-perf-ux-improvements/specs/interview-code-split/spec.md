## ADDED Requirements

### Requirement: Interview page split into modules
The interview page SHALL be split into a custom hook for actions, a layout component for UI, and a page orchestrator.

#### Scenario: useInterviewActions hook contains business logic
- **WHEN** the interview page needs to handle user actions (send, report, retry, new chat, load old interview, mic click)
- **THEN** all action handlers SHALL be defined in `hooks/useInterviewActions.ts` and imported by the page

#### Scenario: InterviewLayout renders main content
- **WHEN** the interview page renders
- **THEN** the main content area (header, mic button, hint, chatbox, timer) SHALL be rendered by `components/Interview/InterviewLayout.tsx`

#### Scenario: page.tsx is orchestrator only
- **WHEN** viewing `app/interview/page.tsx`
- **THEN** it SHALL only import hooks and components, pass props, and render layout + modals. No inline business logic.

#### Scenario: Behavior unchanged after refactor
- **WHEN** a user performs any interview action after the refactor
- **THEN** the behavior SHALL be identical to before the refactor
