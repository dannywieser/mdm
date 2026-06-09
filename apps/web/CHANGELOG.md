# web

## 1.6.1

### Patch Changes

- 4894c0a: Add optional view groups in app config and render grouped dashboard sections on home.
- 4894c0a: Make home dashboard sections (view groups and habits) span the full available width with consistent margins instead of shrinking to fit their card count.
- 077d2eb: Rename the home habit card's "total days" stat label to "days logged" to match the habit detail page's terminology.
- 077d2eb: Redesign the home page habit cards as multi-stat boxes showing habit score, streak, and total days, prefix the title with "do more"/"do less", and show heat dots for over-target do-less habits (matching the detail page). Add `windowEntries` to the `/habits` list response to support the new "total days" stat.
- 077d2eb: Stop force-uppercasing the "score over time" and "personal records" section headers on the habit detail page so they render in their natural lowercase, matching the rest of the page's section labels.
- 077d2eb: Split the habit detail page into two bordered sections — current score/streak details and personal records (highest score, best streak, most days logged) — for clearer visual separation.
- 077d2eb: Replace the "window start" stat card on the habit detail page with a section title reading "current tracking window (since YYYY.MM.DD)".
- 077d2eb: Make the score entries table on the habit detail page collapsible, collapsed by default.
- 077d2eb: Make the habit detail score entries table more concise by combining the value and recency multiplier into a single column, e.g. "9 (x10)".
- 077d2eb: Show a progress bar below the habit score on the detail page comparing it to the target score — the bar fills proportionally when under target, and grows with a red overflow segment when over target.
- 077d2eb: Add a percentage badge next to "days logged" on the habit detail page showing how full the current tracking window is (logged days / window size). The `/habit/:id` response now includes `trackingWindowDays` to support this.
- d41bf25: Replace the NotesGallery flex/grid layout toggle with a single CSS grid masonry layout that uses `grid-auto-flow: dense` and per-card row spans to pack covers of varying heights without leaving gaps.
  - mdm-util@1.6.1

## 1.6.0

### Minor Changes

- 1edfc02: Add habit cards to the home page (color-coded green/yellow/red for do-less habits based on `targetScore`, accent-colored for do-more habits) and a new habit detail route showing the habit's mode in its title, a prominent current score with an info popover explaining the target and how to read it (plus "heat" dots for do-less habits scoring well above target), days logged, current streak, tracking window start, all-time highs (best score, streak, and days logged), a chart of score and streak over time, and a table of the entries contributing to the current score (date — linked to the source note in Obsidian — raw value, and recency multiplier).
- 05cf558: Add GitHub Light High Contrast color palette based on the GitHub light high contrast terminal palette.
- f97b7a0: Add HomeStats card to the home page displaying vault overview stats (totals, notes created by period, trends, and a notes-per-day area chart for the past year). Display is configurable via the `homeStats.show` section in `app.config.json`.
- 25b10b2: NotesGallery now defaults to a flex (CSS multi-column masonry) layout where each card takes its natural height; the previous grid layout is still available by setting `layout: "grid"` on the view in `app.config.json`.

### Patch Changes

- 6e3255f: Add configurable created-date resolution for notes: `createdDateProperty` sets the frontmatter key to read (default `"created"`), and `deriveTitleDate` enables extracting the date from the note title using configured `dateFormats`. Notes without a resolved created date return `null` for `createdDate` and are excluded from notes-per-day and trend calculations. A new `notesWithoutCreatedDate` stat counts them. Fixes incorrect notes-per-day chart data on Linux Docker deployments where `stat.birthtime` was unreliable.
- ceb2a80: Replace the header title with a Chakra breadcrumb: on `/notes/:view` it shows `mdm > <view name>` with "mdm" linking home; on the home route it shows just "mdm". Removes the PageTitle context that was previously used to push the current note title into the header from NotesReview.
- cab244f: Center MarkdownTree images and add graceful fade-in loading for images across MarkdownTree and the cover image gallery.
- 4bd579c: Fix viewport height on mobile Safari (iPad): replace `100vh` with `100dvh` so the app shell correctly accounts for browser chrome. Also switch the root layout from a fixed-height overflow container to a natural-scroll `min-height` container, which improves scroll behaviour on iOS.
- Updated dependencies [be835c4]
  - mdm-util@1.6.0

## 1.5.0

### Minor Changes

- 7d451d4: Add optional `badges` support to view configuration and propagate it through stats/view rendering so NotesList and NotesReview can show note badges from note properties and frontmatter values (including frontmatter arrays).
- 28e9b81: Add `NotesGallery` view component that renders notes as an image gallery using `frontmatter.cover` for the cover image. Notes without a cover are excluded. Configure a view with `"component": "NotesGallery"` in `app.config.json` to use it.
- c8bccce: Add a new `NoteSummaryList` NotesView component that renders matched notes in a table with dynamic badge-driven columns, note links, matched-count header, and back-to-home navigation.

### Patch Changes

- bbc93bc: Replace the header title with a Chakra breadcrumb: on `/notes/:view` it shows `mdm > <view name>` with "mdm" linking home; on the home route it shows just "mdm". Removes the PageTitle context that was previously used to push the current note title into the header from NotesReview.
  - mdm-util@1.5.0

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
