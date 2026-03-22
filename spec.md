# CloudPrint Share

## Current State
New project. No existing features.

## Requested Changes (Diff)

### Add
- Cloud-based printer sharing app with 4 printers
- User authentication (login/register)
- Printer status dashboard (online/offline/busy, ink levels, current job)
- Print job submission (upload file, select printer)
- Job queue management (view, cancel jobs)
- Admin controls for managing printers and jobs

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend: printers CRUD, print jobs CRUD, job queue per printer, user roles (admin/user)
2. Frontend: mobile-first layout, dashboard with 4 printer cards, job submission form, job queue table, auth screens
