# demo-data

Generates the static demo dataset used by the GitHub Pages deployment of `apps/web` (demo mode).

## What it does

`npm run generate` (or `npm run demo:data` from the repository root) runs `src/cli.ts`, which:

1. **Generates a demo vault** — a deterministic (seeded) set of markdown notes representing a personal knowledge system: a daily-ish journal (with habit values in frontmatter, denser in recent months than in the oldest ones), a photo journal, curated books, movies, recipes, quotes, ideas, projects, and people notes. Books, movies, recipes, quotes, and ideas are hand-written (see the `*Corpus.ts` files next to each builder) rather than combinatorially generated, so they read like real notes instead of a title grid. Gallery covers (photos, recipes, and a themed pool for books/movies) are real photos downloaded from a small curated Pexels lockfile (`src/vault/images/pexelsPhotos.json`); if a photo is missing or fails to download, generation falls back to a generated SVG placeholder so it still works fully offline. File modification times are backdated to match each note's date so stats look realistic. The vault is written to `apps/demo-data/.vault` (gitignored).
2. **Snapshots the real APIs** — spawns the actual `notes-api`, `habit-tracker`, and `stats-service` builds against the demo vault (via `NOTES_ROOT` + `APP_CONFIG_PATH`) and captures their responses as static JSON files in `apps/web/public/demo-data` (gitignored):
   - `views.json`, `stats.meta.json`, `stats.history.json`, `habits.json`, `habit.<id>.json`
   - `notes.<view>.json` and `notes.<view>.slim.json` (without parsed content) per configured view
   - `images/attachments/` — the vault's attachments (real downloaded photos, or SVG covers where none was available), so `buildImageUrl` works without the image server
   - `source/<note.id>.md` — each note's raw markdown, shown by the web app's demo-only note source page (which replaces the Obsidian deep link in demo mode)

The timeline always ends on the generation date, so date-relative features (`$today`, `$onThisDay`, habit streaks) have data; the Pages workflow regenerates the snapshot daily.

## Real photos (Pexels)

Gallery covers are real photos rather than illustrations. To keep the daily regeneration reliable and secret-free:

- `src/vault/images/pexelsPhotos.json` is a **committed lockfile** of curated `{ key, photoId, src, width, height }` entries per category (books, movies, recipes, photos), resolved ahead of time against the real Pexels API.
- Generation only ever downloads the pinned `src` CDN URL for each entry (`src/vault/images/downloadImage.ts`) — no API key needed, and results are cached in-memory per run so a reused photo (e.g. a books/movies thematic pool) downloads once. The daily Pages workflow needs no `PEXELS_API_KEY` secret.
- If a builder asks for a category/key with no lockfile entry, or the download fails, it falls back to the original generated SVG cover (`src/vault/covers/coverSvg.ts`) — so `npm run demo:data` still completes fully offline.
- To add or refresh curated photos, run `scripts/resolvePexelsPhotos.ts` locally with your own `PEXELS_API_KEY` (a free tier key from pexels.com/api) — it resolves the query list at the top of the script and rewrites the lockfile. This is a manual maintainer step, not part of `npm run generate` or CI.

## Demo configuration

`app.config.demo.json` is the `app.config.json` used for the demo. It defines 10 grouped views covering every view component (`NotesList`, `NotesGallery`, `NotesReview`, `NotesSummaryTable`) and every filter capability (folder and frontmatter equality, OR groups, `$exclude`, `$missing`, `$today`, `$onThisDay`), plus a single `do-less` habit (screen time). The journal notes still carry `exercise`/`reading` frontmatter values for a `do-more` habit to be reintroduced later once that mode is tuned for the demo. View and habit `name`s are all lowercase. "On This Day" pairs `$onThisDay` with the `NotesReview` component — the vault generator guarantees a journal entry exists on that calendar day in every earlier year of its 3+ year timeline, so the review flow always has entries to step through.

## Structure

- `src/vault/builders/` — one builder per note domain, most paired with a hand-written `*Corpus.ts` of curated content (books, movies, recipes, quotes, ideas, photos) instead of combinatorial generation
- `src/vault/images/` — the curated Pexels photo lockfile, its types, the download/cache helper, and the lookup helpers builders use
- `src/vault/covers/` — SVG cover generation, used as the offline fallback when no real photo is available
- `src/vault/random/`, `src/vault/serializeNote.ts`, `src/vault/writeVault.ts` — seeded random helpers, frontmatter serialization, and the vault writer (handles both text and binary attachment contents)
- `src/snapshot/` — service spawning, health polling, endpoint snapshotting
- `src/cli.ts` — pipeline entry point
- `scripts/resolvePexelsPhotos.ts` — manual, dev-only tool to (re)populate the Pexels lockfile
