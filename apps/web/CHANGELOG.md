# web

## 2.3.0

### Minor Changes

- 5b101ab: Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and displays a note's first image as its cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.

  Removed the `aspectRatio` and `layout` view config fields (from `app.config.json`'s `views`, the `GET /views` response, and the web app's view component props). These had become dead weight: `layout` was never read by any component after an earlier refactor to a CSS masonry grid, and `aspectRatio` only ever sized `NoteCoverGrid`'s pre-load loading skeleton — it did not shape the final rendered card, which sizes itself from the loaded image's natural dimensions. `NoteCoverGrid` now always uses a fixed default skeleton aspect ratio.

  Fixed a bug where a note's external image URL (e.g. `https://...`) in `frontmatter.images` would render as a broken image in the gallery — the web app was always routing it through the local image proxy, which rejects non-local paths. External URLs are now rendered directly, bypassing the proxy. Added a shared `isExternalUrl` helper to `mdm-util` for this check, also adopted by `notes-api`.

  Fixed two smaller edge cases in `frontmatter.images` derivation: a fragment-only image destination (`![alt](#section)`) is no longer surfaced as an image, since it isn't a resolvable image source; and a frontmatter image value with extra whitespace (e.g. from YAML like `" https://... "`) is now trimmed before checking whether it's an external URL, so it no longer gets incorrectly routed through the image proxy.

  Narrowed which external URLs the web app will render directly: only http(s) or protocol-relative URLs bypass the local image proxy now. Any other scheme (`javascript:`, `data:`, `obsidian://`, etc.) renders nothing instead of being passed to `<img src>` unchecked. Added a new `isHttpUrl` helper to `mdm-util` for this.

### Patch Changes

- Updated dependencies [5b101ab]
  - mdm-util@2.3.0
  - services@2.2.0

## 2.2.4

### Patch Changes

- 217b1e0: Fix the web container's Docker healthcheck always reporting unhealthy: it hit "localhost", which resolves to the IPv6 loopback that nginx doesn't bind, so the check now targets 127.0.0.1 directly.
  - mdm-util@2.2.4
  - services@2.1.11

## 2.2.3

### Patch Changes

- 732ffdb: Fix the habit tracking calendar to lay out its months in a responsive grid that fills the available container width, instead of a fixed-width row that left empty space and wrapped awkwardly on smaller screens.
  - mdm-util@2.2.3
  - services@2.1.10

## 2.2.2

### Patch Changes

- 3b6cbe4: Fix the habit card header on the home page so it matches the view card header style (left-aligned, regular weight) instead of appearing centered and bold.
  - mdm-util@2.2.2
  - services@2.1.9

## 2.2.1

### Patch Changes

- 380a398: Fix the web image serving stale content after a deploy: nginx now sends `no-cache` for `index.html`/SPA routes so browsers always revalidate them, and long-lived immutable caching for Vite's content-hashed `/assets/` files, so updates take effect without a manual browser cache clear.
  - mdm-util@2.2.1
  - services@2.1.8

## 2.2.0

### Minor Changes

- acc307c: Add a monthly calendar heatmap to the habit detail page, showing intensity by the tracked frontmatter value per day (date and value on hover), covering the last 6 months that have tracked entries.

### Patch Changes

- mdm-util@2.2.0
- services@2.1.7

## 2.1.6

### Patch Changes

- 1fbcbf0: Fix the notes review "complete" list still using Chakra's default muted color instead of the theme-aware muted text color, so the Dracula contrast fix actually applies to it.
  - mdm-util@2.1.6
  - services@2.1.6

## 2.1.5

### Patch Changes

- 4eb85ae: Increase the Dracula theme's muted text color contrast so read notes in the notes review list are easier to read.
  - mdm-util@2.1.5
  - services@2.1.5

## 2.1.4

### Patch Changes

- 0fe09d8: Fix the contribution graph's hover tooltip rendering all lines squished and overlapping on the stats page — the day cell's `lineHeight={0}` (used to keep grid cells tight) was inherited by the tooltip's text, collapsing every line's height to zero. Also drop the redundant "unusually high" outlier note from the visual tooltip, since the orange coloring already conveys it; it's still available in the legend and in the day cell's `aria-label` for screen reader users.
- 7241f89: Removes the opt-in `watchtower` service and its labels from `docker-compose.yml`. Image updates are now manual only: run `docker compose pull && docker compose up -d --no-build` (or `npm run docker:update`) — `--no-build` avoids falling back to a source build when `docker-compose.yml`'s referenced Dockerfiles aren't present (e.g. a standalone install without a repo checkout).
  - mdm-util@2.1.4
  - services@2.1.4

## 2.1.3

### Patch Changes

- 7ea6359: Fix the contribution graph's hover tooltip on the stats page so each stat (created, modified, folders touched) renders on its own line with roomier padding, instead of being crammed into a single narrow line.
  - mdm-util@2.1.3
  - services@2.1.3

## 2.1.2

### Patch Changes

- 9afffca: Fix client-side route navigation (e.g. clicking into `/stats`) hanging on the previous page and then swapping to the new one fully loaded, with no visible loading transition — React Router v7's `<BrowserRouter>` wraps navigations in `React.startTransition` by default, which suppresses Suspense fallbacks on already-mounted routes; disable that (`useTransitions={false}`) so the app's loading screen shows immediately during navigation, as it already does on first load.

  Also truly parallelize the stats page's meta and history requests via a new combined `useStatsPageData` hook (built on `useSuspenseQueries`) instead of two separate `useSuspenseQuery` calls in the same component — the latter still serializes the requests, since React aborts the render (and never reaches the second hook call) as soon as the first one suspends.

  And change the contribution graph's shading to scale relative to a typical day (median-based, with a floor of 30) rather than the all-time max, flagging days more than 5x the median — and at least 30 — as outliers. Outliers get their own graduated highlight color (rather than one flat color) so a mild outlier reads lighter than an extreme one, and ordinary usage growth from a low baseline isn't misflagged.

  Finally, tighten up the activity graph's layout: smaller day cells, tighter spacing between rows, and a fix for an unrelated line-height quirk that was inflating each row's height well beyond its cell size.
  - mdm-util@2.1.2
  - services@2.1.2

## 2.1.1

### Patch Changes

- 4c80304: Display stats page numbers (notes, folders, words, attachments) in compact notation (e.g. 1.5K, 1.2M) using Chakra UI's FormatNumber component.
- ab3fafb: Adds an opt-in `watchtower` service to `docker-compose.yml`, gated behind a `watchtower` Compose profile (`COMPOSE_PROFILES=watchtower` in `.env`). When enabled, it watches the 6 published `mdm-*` images (labeled explicitly; `redis`/`imgproxy` are left unwatched) and automatically pulls + restarts any container when a new image is published, replacing the need for a cron job or host script to keep a self-hosted deployment on the latest images.
- 48c544d: Switches the opt-in `watchtower` Compose service from `containrrr/watchtower` to `nickfedor/watchtower`, the actively maintained fork. The original image was archived unmaintained in December 2025 and fails against Docker Engine v29+ hosts with `client version 1.25 is too old`, since it ships a Docker client that predates the daemon's new minimum supported API version.
  - mdm-util@2.1.1
  - services@2.1.1

## 2.1.0

### Minor Changes

- 2abe52c: Add a GitHub-style activity graph to the `/stats` page — one square per day, shaded by how many notes were created and modified that day, sourced from the new `GET /stats/history` endpoint. Adds a `useStatsHistory` hook and `StatsHistoryResponse`/`StatsHistoryEntry` types to `services`.

### Patch Changes

- Updated dependencies [2abe52c]
- Updated dependencies [2abe52c]
  - services@2.1.0
  - mdm-util@2.1.0

## 2.0.2

### Patch Changes

- 306e7bb: The new Trivy scan gate (added in a prior change) was failing on every push: Alpine OS packages (`libcrypto3`/`libssl3`, `musl`, `zlib`) with unpatched known CVEs, plus a full set of HIGH-severity CVEs in packages that turned out to be npm's own bundled dependencies (`glob`, `minimatch`, `tar`, `sigstore`, etc. at `/usr/local/lib/node_modules/npm`), not anything from the apps' own dependency trees. Each Dockerfile's runner stage now runs `apk upgrade` for the latest available OS patches and removes the base image's bundled `npm`/`npx`/`corepack`, since none of these images ever invoke npm at runtime (the container only runs `node dist/server.js`).
- a44a0e2: Fixed missing bottom padding on the home page, which caused the final row of view/habit cards to feel cramped against the bottom of the viewport.
- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2
  - services@2.0.2

## 2.0.1

### Patch Changes

- 5e73d92: Rebuild all Docker images as minimal multi-stage builds using `turbo prune` (only ship each app's own dependency subgraph, run as non-root, `NODE_ENV=production`), add a `HEALTHCHECK` to every image so health status works standalone, and publish images to `ghcr.io/dannywieser/mdm-<app>` on every push to `main`. `docker-compose.yml` now references the published images alongside local `build:` config, and `npm run docker:update` pulls and restarts without rebuilding from source.
  - mdm-util@2.0.1
  - services@2.0.1

## 2.0.0

### Minor Changes

- 707d12d: Add a static demo mode and GitHub Pages deployment. `services` gains `configureDemoMode`, which switches the query hooks to pre-built static JSON files, swaps the redis-backed read-flag hooks for per-session browser storage, and maps image URLs to static cover files. `web` bootstraps demo mode via `VITE_DEMO_MODE`, supports sub-path hosting via `VITE_BASE_PATH` (router basename included), and adds a `dev:demo` script. The new `demo-data` app generates a deterministic 1500+ note demo vault (journal with habit data, photos, books, movies, quotes, ideas, projects, recipes, people, plus SVG covers) and snapshots the real `notes-api`/`habit-tracker`/`stats-service` responses into `apps/web/public/demo-data`; `.github/workflows/deploy-pages.yml` regenerates and deploys the demo to GitHub Pages daily and on pushes to `main`. Demo covers vary in decoration motif, palette, and (for photos/recipes) aspect ratio to show off the masonry galleries. In demo mode the "open in Obsidian" button instead opens an in-browser note source page with an explanatory info alert.
- 572b5ff: Update the stats page to use the new `stats-service` meta endpoint. The `services` package gains a `useStatsMeta` hook (replacing the old, notes-api-backed `useStatsQuery`) that fetches `GET /stats/meta` (configurable via `setStatsBaseUrl`/`VITE_STATS_BASE_URL`, defaulting to `/stats`) and exposes `StatsMetaResponse` (`totalNotes`, `totalFolders`, `totalWords`, `totalAttachments`) in place of the old, richer `StatsResponse` shape (a breaking change to `services`). The `/stats` page is simplified to display only this data — total notes, folders, and words, plus an attachment breakdown by file extension — using Chakra UI's Stat component. The notes-created trend chart and folder breakdown, which relied on data no longer returned by the backend, have been removed.

### Patch Changes

- 9b33483: On the habit detail chart, scale the streak axis relative to the score target (using a geometric mean of the streak's peak and the target) instead of stretching it to the same visual height as the score line, so a short streak no longer appears as tall as a much larger score.
- eae4c78: Replace the broken heat dots indicator on habit score displays with an inline overage readout (e.g. "250 (+150)") shown in a distinct color when a do-less habit's score exceeds its target.
- Updated dependencies [707d12d]
- Updated dependencies [fb9cd71]
- Updated dependencies [498a480]
- Updated dependencies [572b5ff]
  - services@2.0.0
  - mdm-util@2.0.0

## 1.10.0

### Patch Changes

- cc9bc64: HeatDots now splits into rows of 5 when more than 5 dots are rendered.
- Updated dependencies [aad607c]
  - mdm-util@1.10.0
  - services@1.8.2

## 1.9.0

### Minor Changes

- dbc54d9: Add score breakdown inside the HabitDetail collapsible section, showing entry scores subtotal, days logged bonus/penalty, streak bonus, and final score.
- dbc54d9: Switch streak and days-logged bonuses to a tiered rate (0.5% for days 1–5, 0.6% for days 6–10, etc.) and expose a per-tier score breakdown in the habit detail collapsible section.

### Patch Changes

- 3942cd8: Add stricter ESLint rule sets (strictTypeChecked, sonarjs, jsx-a11y, vitest, n) and fix all resulting errors across the monorepo.
- b91600f: Fix NotesReview table of contents link color not adapting to the selected color palette.
- dce521d: Fix mismatched keyboard focus outlines on header links and buttons (breadcrumb, stats, palette selector, close), markdown links in note content, and the buttons on the notes review screen, to use the consistent accent-colored focus ring used elsewhere in the app.
- 9b09021: Add more masonry grid columns on large screens (xl: 5, 2xl: 8) so the notes gallery shows more, smaller cards.
  - mdm-util@1.9.0
  - services@1.8.1

## 1.8.0

### Minor Changes

- 9e2f995: Home view cards for "NotesReview" views now show read/unread progress (e.g. `0/10`) and a green check once all notes in the view have been read.
- da76fb7: Add a search input to the header on the notes gallery view that filters note cards by matching keywords against the title, frontmatter, and full note body text. The `/notes` API response now includes a `fullText` field on each note containing its raw markdown body.
- e476e6f: Add a dedicated `GET /views` endpoint that lists configured views along with the matching note IDs and counts, and remove the `views` property from the `/stats` response. The web app now fetches views from the new endpoint.

### Patch Changes

- 31b7059: Preserve single line breaks within markdown paragraphs by rendering them as `<br>` elements instead of collapsing them.
- 11bec29: Fix NotesReview "Mark as Read" toggling already-read notes back to unread, and fast-forward to the next unread note (or end of the list) instead of just advancing by one.
- 11bec29: Fix NotesReview scrolling under the sticky header when moving to a new note, leaving the title hidden for longer notes.
- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.
- Updated dependencies [957fdaa]
  - services@1.8.0
  - mdm-util@1.8.0

## 1.7.0

### Minor Changes

- 7399c56: Add `NotesGalleryByMonth` and `NotesGalleryByYear` views, which group cover-card galleries by month/year with a dropdown to filter to a single month or year.
- 9ef23d7: Add ocean color palette with deep navy background and cyan accent (all WCAG AA contrast ratios verified).
- 9ef23d7: Replace palette popover with a full /colors page showing a themed preview for each palette option.

### Patch Changes

- 5e8cc5c: Add Docker Compose healthchecks for `notes-api`, `flag-manager`, `habit-tracker`, and `image-server` based on their `/health` endpoints, and have `web` wait for all of them to be healthy before starting.
- 7399c56: Fix `NotesGalleryByMonth` and `NotesGalleryByYear` dropping notes that lack a `createdDate`, by falling back to `modifiedDate` for grouping.
- 7313efa: Fix note cover gallery image placeholders collapsing to a sliver while loading by giving them a default aspect ratio when no view aspect ratio is configured.
- db1bddf: Fix the header skeleton (and the static PWA splash header) being slightly shorter than the real header, which caused a layout shift on load.
- 7399c56: Add an `includeContent=false` query param to `GET /notes` that skips remark parsing of note bodies, and use it for the gallery views which only need frontmatter.
- db1bddf: Fix the PWA startup splash so the page background reverts to the user's selected color palette after the app mounts (it was previously stuck on the static splash background due to CSS `@layer` priority), and fix the loading icon briefly appearing oversized and right-aligned before centering.
- d949e4b: Show a static notebook loading icon and matching theme background on initial page load to avoid a blank white flash before the app's JS bundle mounts (especially noticeable when launching as an installed PWA).
- 88032d0: Renamed the `GET /habit/:id` endpoint to `GET /habits/:id` for REST consistency with `GET /habits`, and consolidated the `habit` and `habits` handler folders into `habits` and `habit-detail`.
- 18dca6d: Extract hardcoded stats page strings to i18n (lowercased to match the rest of the app), remove the all-uppercase heading styling, and add a close button matching the colors page that returns to the previous route.
- 7399c56: Strip surrounding quote characters from frontmatter `cover` paths so notes whose cover value is wrapped in quotes load images correctly.
  - mdm-util@1.7.0

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
