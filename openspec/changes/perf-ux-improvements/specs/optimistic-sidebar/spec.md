## ADDED Requirements

### Requirement: Optimistic UI for sidebar rename
The sidebar SHALL update the interview title in the UI immediately before the API call completes.

#### Scenario: Successful rename
- **WHEN** user renames an interview and the API succeeds
- **THEN** the new title SHALL already be displayed in the sidebar (no flicker or loading state)

#### Scenario: Failed rename
- **WHEN** user renames an interview and the API fails
- **THEN** the sidebar SHALL rollback to the previous title AND show an error toast

### Requirement: Optimistic UI for sidebar delete
The sidebar SHALL remove the interview item from the UI immediately before the API call completes.

#### Scenario: Successful delete
- **WHEN** user deletes an interview and the API succeeds
- **THEN** the interview item SHALL already be removed from the sidebar

#### Scenario: Failed delete
- **WHEN** user deletes an interview and the API fails
- **THEN** the sidebar SHALL re-insert the deleted item at its original position AND show an error toast
