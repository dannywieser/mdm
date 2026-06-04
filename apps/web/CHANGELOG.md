# web

## 1.4.0

### Minor Changes

- 42905a6: NotesReview now shows a table of contents alongside the note being reviewed. On desktop a sidebar lists all notes with read ones muted and unread ones bold. On mobile a trigger button shows the current position (e.g. "2/9") and opens a full-screen drawer with the same list. The header displays the current note title. On page load the review starts at the first unread note.
- 4f641ae: NotesReview improvements: extract linked notes into a shared `LinkedNotesList` component used by both `NotesCard` and `NotesReview`; fix flash of note 0 and icon flicker during initial read-state load; show an animated summary of reviewed note titles on the complete screen followed by a link back to home.
- 13c836d: Add terminal-inspired color palette theming to the web app (Dracula, Gruvbox, Nord, Catppuccin, Solarized), including a header palette selector with persisted localStorage preference and semantic-token based color usage across core UI components.

### Patch Changes

- mdm-util@1.4.0

## 1.3.0

### Minor Changes

- ef112d7: Reorganized web components and hooks into per-feature folders and moved the shared header into a parent route so notes views use the same page shell.
- 947679f: Add NotesReview component — presents notes for a view one at a time, with buttons to mark each as read (advancing to the next) or skip. Accessible at `/notes/:view/review`.
- 298b99c: Refactor notes markdown parsing and rendering to use markdown node trees instead of HTML, including Chakra-based markdown rendering and wikilink/image handling updates.
- 947679f: Views in `app.config.json` now require three distinct fields:
  - `id` — the route key used in `GET /notes?view=<id>` and `/notes/:view` routing
  - `name` — human-readable label displayed in the UI
  - `component` — the web component used to render that view route (for example `NotesList` or `NotesReview`)

  The `GET /stats` response includes `id` and `component` alongside `name` and `count` for each view. The web route `/notes/:view` resolves the configured component by `id` and renders it dynamically.

### Patch Changes

- mdm-util@1.3.0

## 1.2.0

### Minor Changes

- bc20358: Add a `GET /stats` endpoint returning total note count, notes modified today, and per-view note counts. The web home page now fetches and displays these stats below the notebook icon.

### Patch Changes

- c30d89d: Add note read status hooks and a note card toggle that collapses read notes.
  - mdm-util@1.2.0

## 1.1.0

### Minor Changes

- 7e53688: Add Obsidian-style `[[wikilink]]` resolution to the notes pipeline. Matched wikilinks render as clickable `obsidian://` links; unmatched wikilinks render with a dashed underline. The web UI displays linked notes in a collapsible section at the bottom of each card.

### Patch Changes

- e41efd1: Add initial Changesets setup for the monorepo, including root scripts, fixed-release configuration, and contributor docs for changelog entries.
- 3371e19: Fix markdown list and task-list CSS styles: restore bullet and number markers for unordered and ordered lists, and add proper styling for GFM task-list items (`contains-task-list` / `task-list-item`).
