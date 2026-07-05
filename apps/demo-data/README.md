# demo-data

Generates the static demo dataset used by the GitHub Pages deployment of `apps/web` (demo mode).

## What it does

`npm run generate` (or `npm run demo:data` from the repository root) runs `src/cli.ts`, which:

1. **Generates a demo vault** — a deterministic (seeded) set of 1500+ markdown notes representing a multi-year personal knowledge system: a daily journal (with habit values in frontmatter), a photo journal, books, movies, quotes, ideas, projects, recipes, and people notes. SVG cover images are generated for gallery views, and file modification times are backdated to match each note's date so stats look realistic. The vault is written to `apps/demo-data/.vault` (gitignored).
2. **Snapshots the real APIs** — spawns the actual `notes-api` and `habit-tracker` builds against the demo vault (via `NOTES_ROOT` + `APP_CONFIG_PATH`) and captures their responses as static JSON files in `apps/web/public/demo-data` (gitignored):
   - `views.json`, `habits.json`, `habit.<id>.json`
   - `notes.<view>.json` and `notes.<view>.slim.json` (without parsed content) per configured view
   - `images/` — the vault's attachments (cover SVGs), so `buildImageUrl` works without the image server

The stats page is not part of the demo (the web app still targets the legacy `/stats` shape while `stats-service` migrates to `/stats/meta`), so no stats snapshot is captured and the header stats link is hidden in demo mode.

The timeline always ends on the generation date, so date-relative features (`$today`, `$onThisDay`, habit streaks) have data; the Pages workflow regenerates the snapshot daily.

## Demo configuration

`app.config.demo.json` is the `app.config.json` used for the demo. It defines 12 grouped views covering every view component (`NotesList`, `NotesGallery`, `NotesGalleryByMonth`, `NotesGalleryByYear`, `NotesReview`, `NotesSummaryTable`) and every filter capability (folder and frontmatter equality, OR groups, `$exclude`, `$missing`, `$today`, `$onThisDay`), plus three habits (`do-more` and `do-less` modes).

## Structure

- `src/vault/` — seeded random helpers, per-domain note builders, SVG cover generation, vault writer
- `src/snapshot/` — service spawning, health polling, endpoint snapshotting
- `src/cli.ts` — pipeline entry point
