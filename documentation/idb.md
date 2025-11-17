# IndexedDB Storage (Local PDFs)

## File: `static/src/js/idb.js`

### Purpose
Persist uploaded PDFs in the end-user browser so documents remain available offline and across page reloads.

### Implementation
- Uses the native IndexedDB API.
- Core helpers:
  - `savePDF(id, file)`: persist a PDF under a unique identifier.
  - `getPDF(id)`: fetch a PDF by identifier.
  - `getAllPDFs()`: list every stored PDF entry.
  - `deletePDF(id)`: remove a stored PDF.
- Database layout:
  - Name: `finassist-pdf-db`
  - Object store: `pdfs` (primary key `id`)

### Technical Notes
- Documents survive refreshes and browser restarts.
- The frontend reloads persisted PDFs during initialization to repopulate the UI.
- Drag-and-drop, delete, and selection flows leverage these helpers for consistent state.

### Current Limitations
- Storage quotas vary by browser (typically a few hundred megabytes).
- No cross-device synchronization.
- Data is stored unencrypted.

### Potential Improvements
- Add client-side encryption before persisting files.
- Sync IndexedDB entries to a backend for multi-device continuity.
- Track document versions and metadata to support collaboration.
