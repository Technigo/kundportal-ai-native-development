# Frontend specification – Kundserviceportalen NORS

> **Historiskt underlag.** Filen beskriver den ursprungliga frontenden från [PR #3](https://github.com/Ottowski/nors-kundportal-development/pull/3), som den såg ut på grenen `frontend` 2026-11-05. Frontenden i `main` är rättad mot specen, se [PR #7](https://github.com/Ottowski/nors-kundportal-development/pull/7). R#/A# här syftar på `kundportal-sdd`, inte på `kravspec.md`. Det som gäller står i [kravspec.md](../specs/kravspec.md) och [verifieringsplan.md](../verifieringsplan.md).

```text
┌───────────────┬─────────────────────────────────────┐
│ Field         │ Value                               │
├───────────────┼─────────────────────────────────────┤
│ Part          │ frontend/ (React, TypeScript, Vite) │
├───────────────┼─────────────────────────────────────┤
│ Owner         │ Sravani Padarthi                    │
├───────────────┼─────────────────────────────────────┤
│ State checked │ 2026-11-05                          │
└───────────────┴─────────────────────────────────────┘
```

**Related:** [Testing specification](testing-spec.md), [architecture flow](architecture-flow.md)

> The R#/A# ids refer to the requirements in `kundportal-sdd/specs/`.

## Summary

```text
┌──────┬───────────────────────┬──────────────────┬──────────────────────────┬───────────────┐
│ Task │ Feature               │ Requirements     │ Against real backend     │ Against mocks │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-1 │ Case list             │ R6, A6           │ Works                    │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-2 │ Create a case         │ R1–R4, A1–A4     │ Works                    │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-3 │ Case details          │ R7, R10, A7, A10 │ Works                    │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-4 │ Change status         │ R8, R9, A8, A9   │ Not working: no endpoint │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-5 │ Search and filter     │ R11, A11–A16     │ Works                    │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-6 │ API client and errors │ R3, R10          │ Partly: see FE-4         │ Works         │
├──────┼───────────────────────┼──────────────────┼──────────────────────────┼───────────────┤
│ FE-7 │ Mock mode, edit and   │ Outside v1.0     │ Edit and delete are      │ Works         │
│      │ delete                │                  │ switched off             │               │
└──────┴───────────────────────┴──────────────────┴──────────────────────────┴───────────────┘
```

"Works" against the real backend is based on the API tests and the manual checks reported in the PR.
The UI was not re-tested in a browser on the date above. "Works" against mocks is based on the
frontend tests.

File paths in the task tables are relative to `frontend/src/`.

## Endpoints

```text
┌────────┬──────────────────────┬───────────────────────┬─────────────────────────┐
│ Method │ Path                 │ Used by               │ Status                  │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ GET    │ /arenden             │ App.tsx (list)        │ Backend + mock          │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ GET    │ /arenden/{id}        │ ArendeDetail.tsx      │ Backend + mock          │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ POST   │ /arenden             │ ArendeForm.tsx        │ Backend + mock          │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ POST   │ /arenden/{id}/status │ StatusSelect.tsx      │ Mock only (proposed)    │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ PUT    │ /arenden/{id}        │ ArendeForm.tsx (edit) │ Mock only, outside v1.0 │
├────────┼──────────────────────┼───────────────────────┼─────────────────────────┤
│ DELETE │ /arenden/{id}        │ ArendeDetail.tsx      │ Mock only, outside v1.0 │
└────────┴──────────────────────┴───────────────────────┴─────────────────────────┘
```

## Requirements

```text
┌─────┬────────────────────────────────────────────┬────────────┬────────────┐
│ Id  │ Requirement                                │ Task       │ Status     │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R1  │ A new case gets status "Nytt"              │ FE-2       │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R2  │ All fields are required                    │ FE-2       │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R3  │ Backend validation errors reach the fields │ FE-2, FE-6 │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R4  │ To confirm in kundportal-sdd/specs/        │ FE-2       │ To confirm │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R6  │ The list shows all cases, newest first     │ FE-1       │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R7  │ Details show all fields                    │ FE-3       │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R8  │ The status can be changed                  │ FE-4       │ Mocks only │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R9  │ An invalid status is rejected              │ FE-4       │ Mocks only │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R10 │ A missing case gives a clear message       │ FE-3, FE-6 │ Met        │
├─────┼────────────────────────────────────────────┼────────────┼────────────┤
│ R11 │ Search and filter                          │ FE-5       │ Met        │
└─────┴────────────────────────────────────────────┴────────────┴────────────┘
```

R5 (data survives a restart) is a backend requirement. Acceptance criteria (A#) are named in the
scenarios below and traced to their tests in the
[testing specification](testing-spec.md#traceability).

---

## FE-1: Case list

### Task

Show all cases on the start page in a table with the columns Rubrik, Status, Prioritet, Skapad and
Åtgärder, newest first.

### Purpose

A case handler needs to see every case and its state at a glance, and to know whether an empty page
means "no cases" or "something went wrong".

### Acceptance criteria

```gherkin
Scenario: A6 The list shows the agreed columns
  Given cases exist
  When the handler opens the portal
  Then the "Alla ärenden" list shows title, status, priority and created date for each case
  And no side panel is open

Scenario: R6 The newest case comes first
  Given cases with different created dates
  When the list is shown
  Then they are ordered by created date, newest first

Scenario: Loading state
  Given the list has not loaded yet
  When the handler opens the portal
  Then "Laddar ärenden…" is shown

Scenario: Empty state
  Given no cases exist
  When the handler opens the portal
  Then the message "Inga ärenden ännu" is shown

Scenario: Server cannot be reached
  Given the API is down
  When the handler opens the portal
  Then an error message and a "Försök igen" button are shown
  And clicking the button loads the list again

Scenario: Dates use the Swedish format
  Given a case has a created date from the API
  When the list is shown
  Then the date and time are formatted for sv-SE
```

### Expected outcome

The list handles its loading, empty, error and loaded states. Sort order is a provisional proposal
(Q6).

```text
┌────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│ Item       │ Files or behaviour                                                              │
├────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Code       │ App.tsx, components/ArendeList.tsx, utils/filterArenden.ts, utils/formatDate.ts │
├────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Tests      │ App.test.tsx, utils/filterArenden.test.ts                                       │
├────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Not tested │ Loading state, date format                                                      │
└────────────┴─────────────────────────────────────────────────────────────────────────────────┘
```

---

## FE-2: Create a case

### Task

Add a form, opened from "+ Nytt ärende", with the required fields Rubrik, Beskrivning, Kategori and
Prioritet.

### Purpose

New customer issues must be registered with enough information to act on. Invalid input must be
caught early and must never make the handler retype what they entered.

### Acceptance criteria

```gherkin
Scenario: A1 Create a valid case
  Given the form is open and all fields are filled in
  When the handler clicks "Skapa ärende"
  Then the case is saved with status "Nytt"
  And it appears first in the list
  And its details open in the side panel

Scenario: A2 Missing title
  Given the title is empty
  When the handler submits the form
  Then "Rubrik måste fyllas i." is shown
  And nothing is saved

Scenario: A3 Title with only spaces
  Given the title contains only spaces
  When the handler submits the form
  Then the title counts as empty
  And nothing is saved

Scenario: R2 Every required field is validated
  Given all fields are empty
  When the handler submits the form
  Then each field shows its own message
  And focus moves to the first invalid field

Scenario: A4 The backend rejects a field
  Given the form passes frontend validation
  When the backend answers 422 for a field
  Then the message appears at that field
  And "Kontrollera fälten och försök igen." is shown for the form
  And the handler's input is kept

Scenario: No double submission
  Given the form is filled in correctly
  When the handler submits it and the save is still in progress
  Then the submit button is disabled and shows "Sparar…"

Scenario: Surrounding spaces are removed
  Given the title or description has spaces before or after the text
  When the handler submits the form
  Then the text is sent without those spaces

Scenario: Cancel
  Given the form is open
  When the handler clicks "Avbryt"
  Then the form closes without saving
```

### Expected outcome

The handler can register a case in the side panel and it appears in the list without a reload.
Kategori and Prioritet values are provisional (Q1/Q2) and live only in `constants/arende.ts`.

```text
┌────────────┬──────────────────────────────────────────────┐
│ Item       │ Files or behaviour                           │
├────────────┼──────────────────────────────────────────────┤
│ Code       │ components/ArendeForm.tsx                    │
├────────────┼──────────────────────────────────────────────┤
│ Tests      │ components/ArendeForm.test.tsx, App.test.tsx │
├────────────┼──────────────────────────────────────────────┤
│ Not tested │ Removal of surrounding spaces in the form    │
└────────────┴──────────────────────────────────────────────┘
```

---

## FE-3: Case details

### Task

Open a case in a side panel when its row is clicked, showing all fields.

### Purpose

The handler needs the full case without losing their place in the list.

### Acceptance criteria

```gherkin
Scenario: A7 Open a case
  Given the list is shown
  When the handler clicks a row
  Then the side panel shows all fields of the case
  And the list stays visible
  And the row is marked as the current one

Scenario: Close the panel
  Given a case is open in the side panel
  When the handler clicks "Stäng"
  Then the panel closes

Scenario: Loading state
  Given the case has not loaded yet
  When the panel opens
  Then "Laddar ärende…" is shown

Scenario: A10 The case does not exist
  Given the case id is unknown to the backend
  When the details are loaded
  Then "Ärendet hittades inte" is shown

Scenario: Keyboard access
  Given the list is shown
  When a keyboard user activates the title button in a row
  Then the same side panel opens
```

### Expected outcome

Details open beside the list and close with "Stäng". A missing case gives a clear message rather
than a blank panel.

```text
┌────────────┬─────────────────────────────────────────────────────────┐
│ Item       │ Files or behaviour                                      │
├────────────┼─────────────────────────────────────────────────────────┤
│ Code       │ components/ArendeDetail.tsx, components/StatusBadge.tsx │
├────────────┼─────────────────────────────────────────────────────────┤
│ Tests      │ components/ArendeDetail.test.tsx, App.test.tsx          │
├────────────┼─────────────────────────────────────────────────────────┤
│ Not tested │ Loading state, keyboard access                          │
└────────────┴─────────────────────────────────────────────────────────┘
```

---

## FE-4: Change status

### Task

Let the handler change a case's status in the side panel. The allowed values are Nytt, Pågående,
Väntar på kund and Avslutat.

### Purpose

Status tells the team where each case stands. It is part of the agreed v1.0 scope.

### Acceptance criteria

These scenarios are met against the mocked API only (see the known gap below).

```gherkin
Scenario: A8 Change the status
  Given a case is open
  When the handler selects a new status
  Then the status is updated in the panel and in the list
  And the other fields are unchanged

Scenario: A9 Rejected status
  Given a case is open with status "Nytt"
  When the backend rejects the new status
  Then a message is shown
  And the selector still shows "Nytt"

Scenario: The user switched case during the request
  Given a status request is in progress
  When the handler opens another case before the response arrives
  Then the panel keeps showing the newly opened case
```

### Expected outcome

The status changes in both the panel and the list, on every environment.

**Known gap: not met against the real backend.**

```text
┌──────────────────┬───────────────────────────────────────────────────────────────────────────┐
│ Item             │ Details                                                                   │
├──────────────────┼───────────────────────────────────────────────────────────────────────────┤
│ Cause            │ POST /arenden/{id}/status is missing, so the request returns 404          │
├──────────────────┼───────────────────────────────────────────────────────────────────────────┤
│ Effect           │ The handler sees "Not Found" and the status does not change               │
├──────────────────┼───────────────────────────────────────────────────────────────────────────┤
│ Needed to finish │ The backend endpoint, plus a disabled selector or a Swedish message until │
│                  │ then                                                                      │
└──────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

```text
┌────────────┬────────────────────────────────────────────────────────────────────────────────┐
│ Item       │ Files or behaviour                                                             │
├────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ Code       │ components/StatusSelect.tsx                                                    │
├────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ Tests      │ components/ArendeDetail.test.tsx, App.test.tsx, api/arendenApi.test.ts, all on │
│            │ mocks                                                                          │
├────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ Not tested │ None                                                                           │
└────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

---

## FE-5: Search and filter

### Task

Add text search and filters for status, category and priority. Filtering runs in the browser on the
loaded list.

### Purpose

As the number of cases grows, handlers need to find one case or one type of case quickly.

### Acceptance criteria

```gherkin
Scenario: A11 Search by text
  Given cases are loaded
  When the handler searches for text from a title or description
  Then only matching cases are shown

Scenario: A12 Case is ignored
  Given a case titled "Faktura saknas"
  When the handler searches for "FAKTURA"
  Then the case is found

Scenario: Swedish characters ignore case
  Given a case titled "Fel på faktura"
  When the handler searches for "FEL PÅ"
  Then the case is found

Scenario: A13 Filter by status
  Given cases with different statuses
  When the handler selects a status filter
  Then only cases with that status are shown

Scenario: Filter by category
  Given cases with different categories
  When the handler selects a category filter
  Then only cases with that category are shown

Scenario: Filter by priority
  Given cases with different priorities
  When the handler selects a priority filter
  Then only cases with that priority are shown

Scenario: A14 Search and filters combine
  Given a search text and a filter are both set
  When the list updates
  Then only cases matching both are shown

Scenario: A15 No matches
  Given no case matches the search
  When the list updates
  Then "Inga ärenden matchar" is shown

Scenario: A16 Search with only spaces
  Given the search box contains only spaces
  When the handler searches
  Then all cases are shown

Scenario: Surrounding spaces are ignored
  Given the search text has spaces before or after it
  When the handler searches
  Then the result is the same as without the spaces

Scenario: Special characters are plain text
  Given the search text is "<script>"
  When the handler searches
  Then it is treated as plain text and nothing is executed

Scenario: When search and filters apply
  Given the handler has typed search text
  When the handler has not yet pressed Enter or clicked "Sök"
  Then the list has not changed
  But selecting a filter applies at once

Scenario: Search length limit
  Given the handler is typing in the search box
  When the text reaches 100 characters
  Then no more characters are accepted

Scenario: R11.8 The loaded list is not changed
  Given cases are loaded
  When a search or filter runs
  Then the input list itself is unchanged
```

### Expected outcome

Search covers title and description (Q7) and applies on Enter or the "Sök" button (Q11 proposal), and
filters apply at once. Filtering stays in the frontend until Q9 is decided, so it only covers cases
that are already loaded.

```text
┌────────────┬─────────────────────────────────────────────────────────────────────────────────────┐
│ Item       │ Files or behaviour                                                                  │
├────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Code       │ components/SearchFilterBar.tsx, utils/filterArenden.ts                              │
├────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Tests      │ utils/filterArenden.test.ts, App.test.tsx                                           │
├────────────┼─────────────────────────────────────────────────────────────────────────────────────┤
│ Not tested │ List unchanged until search applies, category filter in the UI, search length limit │
└────────────┴─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## FE-6: API client and error handling

### Task

Route every backend call through `api/arendenApi.ts`, and turn FastAPI errors into one `ApiError`
type with per-field messages.

### Purpose

One entry point keeps error handling consistent, so components never have to interpret HTTP
responses or show raw technical text.

### Acceptance criteria

```gherkin
Scenario: R3 Validation error from the backend
  Given the backend answers 422 with a list in "detail"
  When the client handles the response
  Then each message is mapped to its field
  And the "Value error, " prefix from Pydantic is removed

Scenario: R10 Error message from the backend
  Given the backend answers 404 with a text "detail"
  When the client handles the response
  Then the backend's message is used

Scenario: Network failure
  Given the server cannot be reached
  When any request is made
  Then the message is "Kunde inte nå servern. Försök igen."

Scenario: Server error without JSON
  Given the backend answers with a non-JSON error
  When the client handles the response
  Then the message is "Något gick fel. Försök igen."
```

### Expected outcome

No component calls `fetch` directly. Known gap: a text `detail` is shown as received, which is how
the English "Not Found" in FE-4 reaches the user.

```text
┌────────────┬────────────────────────────────────┐
│ Item       │ Files or behaviour                 │
├────────────┼────────────────────────────────────┤
│ Code       │ api/arendenApi.ts, api/apiError.ts │
├────────────┼────────────────────────────────────┤
│ Tests      │ api/arendenApi.test.ts             │
├────────────┼────────────────────────────────────┤
│ Not tested │ None                               │
└────────────┴────────────────────────────────────┘
```

---

## FE-7: Mock mode, edit and delete

### Task

Provide `npm run dev:mock` to run the whole UI on MSW without a backend, and keep edit and delete
behind the `isEditDeleteEnabled()` flag.

### Purpose

Frontend work can continue before backend endpoints exist. Edit and delete are outside v1.0
(ADR-002), so they must not look available when the real API cannot support them.

### Acceptance criteria

Edit and delete scenarios are met against the mocked API only, because the backend has no `PUT` or
`DELETE /arenden/{id}`.

```gherkin
Scenario: The app runs without a backend
  Given the app was started with "npm run dev:mock"
  When the handler uses the list, form and status change
  Then everything works on the mocked API

Scenario: Edit and delete are off against the real backend
  Given the app runs without mock mode and the flag is not set
  When a case is shown
  Then the edit and delete controls are disabled
  And the row icons show "Inte tillgängligt än – API saknas"
  And the panel shows "Redigera och ta bort är inte tillgängliga än (API saknas)."

Scenario: The flag overrides the default
  Given VITE_ENABLE_EDIT_DELETE is set
  When the app runs in any mode
  Then edit and delete are on only if the value is "true"

Scenario: Open the edit form
  Given edit and delete are enabled
  When the handler clicks "Redigera" in the panel or the edit icon in a row
  Then the edit form opens in the panel with the fields filled in

Scenario: Save changes
  Given the edit form is open
  When the handler changes a field and clicks "Spara ändringar"
  Then the same case is updated in the list and in the details
  And no new case is created
  And its status, id and created date are unchanged

Scenario: Save as a new case
  Given the edit form is open
  When the handler clicks "Spara som nytt ärende"
  Then a new case is created with status "Nytt"
  And the original case is unchanged

Scenario: Save as a new case is validated
  Given the edit form has an empty required field
  When the handler clicks "Spara som nytt ärende"
  Then the same validation as for creating a case applies

Scenario: A category outside the provisional list is kept
  Given a case has a category that is not in the list of options
  When the edit form opens
  Then that category is still selected

Scenario: Row icons do not open the row
  Given the list is shown
  When the handler clicks a row's edit icon
  Then the edit form opens instead of the details

Scenario: Delete needs confirmation
  Given edit and delete are enabled
  When the handler clicks "Ta bort" in the panel or the delete icon in a row
  Then confirmation is requested before anything is deleted
  And "Avbryt" keeps the case

Scenario: Confirmed delete
  Given the delete confirmation is shown
  When the handler clicks "Ja, ta bort"
  Then the case is removed from the list
  And the panel closes
  And "Ärendet togs bort." is shown

Scenario: Failed delete
  Given the delete confirmation is shown
  When the handler clicks "Ja, ta bort" and the request fails
  Then an error message is shown
  And the case is kept
```

### Expected outcome

The team can demonstrate the full flow in mock mode, while the real-backend build offers only what
the API supports. The team still has to decide whether to keep edit and delete at all.

```text
┌────────────┬──────────────────────────────────────────────────────────────────────────────┐
│ Item       │ Files or behaviour                                                           │
├────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Code       │ constants/features.ts, mocks/handlers.ts, components/ArendeForm.tsx,         │
│            │ components/ArendeDetail.tsx, components/ArendeList.tsx                       │
├────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Tests      │ App.disabledFeatures.test.tsx, App.test.tsx, components/ArendeForm.test.tsx, │
│            │ components/ArendeDetail.test.tsx, api/arendenApi.test.ts                     │
├────────────┼──────────────────────────────────────────────────────────────────────────────┤
│ Not tested │ Starting npm run dev:mock, default flag value for each mode                  │
└────────────┴──────────────────────────────────────────────────────────────────────────────┘
```

---

## Open items

```text
┌───┬──────────────────────────┬────────────┬───────────────────────┬──────────────────────────┐
│ # │ Item                     │ Task       │ Needs                 │ Owner                    │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 1 │ Status change does not   │ FE-4       │ Backend endpoint;     │ Otto (endpoint), Sravani │
│   │ work against the real    │            │ interim UI handling   │ (UI)                     │
│   │ backend                  │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 2 │ Raw backend text can     │ FE-4, FE-6 │ Frontend fix          │ Sravani                  │
│   │ reach the user           │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 3 │ Keep or remove edit and  │ FE-7       │ Decision              │ Team                     │
│   │ delete                   │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 4 │ Provisional categories   │ FE-2, FE-5 │ Decision              │ Team                     │
│   │ and priorities (Q1/Q2)   │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 5 │ Provisional sort order   │ FE-1       │ Decision              │ Team                     │
│   │ (Q6)                     │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 6 │ Provisional search       │ FE-5       │ Decision              │ Team                     │
│   │ behaviour (Q7, Q9, Q11)  │            │                       │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 7 │ Confirm what R4 requires │ FE-2       │ Compare with          │ Sravani                  │
│   │                          │            │ kundportal-sdd/specs/ │                          │
├───┼──────────────────────────┼────────────┼───────────────────────┼──────────────────────────┤
│ 8 │ docs/projekt.md says     │ All        │ Update that document  │ Team                     │
│   │ JavaScript, but the      │            │                       │                          │
│   │ frontend is TypeScript   │            │                       │                          │
└───┴──────────────────────────┴────────────┴───────────────────────┴──────────────────────────┘
```
