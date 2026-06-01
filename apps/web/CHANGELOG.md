# web

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
