# Requirements

A customer service portal used by support agents (handläggare), not end customers
Workflow: customer sends email, agent opens portal, agent registers the case
No customer login required; portal is internal/agent-facing only

## MVP

### Frontend
- Create a new case (form: title, description, category, priority, status, creation date, customer name/email)
- View all cases (list with customer email and some other basic info for filtering later) 
- View individual case (detail page) and be able to update information 
Change case status (new, in progress, waiting for customer, closed)

### Backend
- Basic case CRUD for cases

## Additional features (To be planned)
- search and filter cases (at least one required, this one seems most useful)
- internal notes
- case assignment to specific agent
- role-based permissions
- customer login

## Current plan

### UI: Planned Pages

Page 1: form to create a new case
Page 2: list of all cases with search and filter
Page 3: individual case detail (status change + description)
No login page needed for MVP
Data Model Notes

Each case identified by a generated ID
Customer identified by email (less ambiguous than name, lower GDPR risk)
All data fictional for the course demo, so GDPR exposure is minimal
Customer database not needed; track cases individually

### Backend

Basic API with CRUD for cases, no authentication or authorization.
