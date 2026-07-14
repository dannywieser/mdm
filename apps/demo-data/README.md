# demo-data

Generates the static demo dataset used by the GitHub Pages deployment of `apps/web` (demo mode).

## What it does

`npm run generate` (or `npm run demo:data` from the repository root) runs `src/cli.ts`, which:

1. **Generates a demo vault** — a deterministic (seeded) set of 1500+ markdown notes representing a multi-year personal knowledge system: a daily journal (with habit values in frontmatter), a photo journal, books, movies, quotes, ideas, projects, recipes, and people notes. SVG cover images are generated for gallery views — each kind has several decoration motifs and color palettes, and photo/recipe covers mix intrinsic aspect ratios (square, letterbox, portrait, panorama) so masonry galleries show varied cell heights. File modification times are backdated to match each note's date so stats look realistic. The vault is written to `apps/demo-data/.vault` (gitignored).
2. **Snapshots the real APIs** — spawns the actual `notes-api`, `habit-tracker`, and `stats-service` builds against the demo vault (via `NOTES_ROOT` + `APP_CONFIG_PATH`) and captures their responses as static JSON files in `apps/web/public/demo-data` (gitignored):
   - `views.json`, `stats.meta.json`, `stats.history.json`, `habits.json`, `habit.<id>.json`
   - `notes.<view>.json` and `notes.<view>.slim.json` (without parsed content) per configured view
   - `images/attachments/` — the vault's attachments (cover SVGs), so `buildImageUrl` works without the image server
   - `source/<note.id>.md` — each note's raw markdown, shown by the web app's demo-only note source page (which replaces the Obsidian deep link in demo mode)

The timeline always ends on the generation date, so date-relative features (`$today`, `$onThisDay`, habit streaks) have data; the Pages workflow regenerates the snapshot daily.

## Demo configuration

`app.config.demo.json` is the `app.config.json` used for the demo. It defines 10 grouped views covering every view component (`NotesList`, `NotesGallery`, `NotesReview`, `NotesSummaryTable`) and every filter capability (folder and frontmatter equality, OR groups, `$exclude`, `$missing`, `$today`, `$onThisDay`), plus three habits (`do-more` and `do-less` modes). "On This Day" pairs `$onThisDay` with the `NotesReview` component — the vault generator guarantees a journal entry exists on that calendar day in every earlier year, so the review flow always has entries to step through.

## Structure

- `src/vault/` — seeded random helpers, per-domain note builders, SVG cover generation, vault writer
- `src/snapshot/` — service spawning, health polling, endpoint snapshotting
- `src/cli.ts` — pipeline entry point
