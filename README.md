# (m)ark(d)own (m)emory
Markdown Memory (mdm) is for those of us who love markdown as a way to capture our thoughts, our journals, our experiences, our memories, photos, knowledge, and everything and anything else, but also acknowledge that the act of _reviewing_ and _reflecting_ on that markdown is very different than capturing it.

mdm is a self-hosted application which you point at an [Obsidian](https://obsidian.md/) vault, and it will provide RESTful API access and a web application for viewing your notes. Nothing leaves your machine — mdm reads the vault directly off disk, and everything it stores itself (per-note read/done flags, a short-lived cache of resolved image URLs) lives in its own Redis instance.

The core part of mdm are fully configurable **views**, which are similar to Bases in Obsidian, with some power ups to improve their interaction. A view is a name plus a set of folder/frontmatter/date filters, so the same vault can be sliced as many ways as you have use cases — no re-tagging notes, no schema to migrate. Point each view at whichever UI fits the content:

- an [inbox-style review](https://demo.markdownmemory.com/notes/on-this-day) that surfaces notes one at a time and tracks what you've read,
- a **sortable table** with badge-annotated columns, or
- a [gallery](https://demo.markdownmemory.com/notes/movies) — grid, or grouped by month/year — for image-heavy notes like books, journals, or photos.

Wikilinks between notes resolve automatically (so a view can surface a note's linked notes too), and every note carries a deep link back into Obsidian, so you're never more than a click from editing the real thing.

The other feature currently included in mdm is habit tracking. This takes a simple frontmatter property in your notes and provides an interface for allowing you to track habits more effectively through your markdown. Each habit gets a running score with streak and consistency multipliers — bonuses for `do-more` habits, penalties for `do-less` ones — plus a full day-by-day history to plot and a breakdown of exactly which days and streaks moved the score.

Rounding it out, a stats page gives you aggregate counts across the vault (notes, folders, words, attachments) alongside a GitHub-style activity graph — one square per day, shaded by how much you wrote or edited, with outlier days called out.

See it in action in the demo: [demo.markdownmemory.com](https://demo.markdownmemory.com)

## Running mdm against your own notes

mdm ships as a set of published Docker images, so you can run it against your own notes vault (any folder of `.md`/`.markdown` files, such as an Obsidian vault) without cloning this repo or installing Node. From any directory:

```bash
curl -fsSL https://raw.githubusercontent.com/dannywieser/mdm/main/infra/docker/quickstart.sh | bash -s -- mdm
```

This downloads `docker-compose.yml` and an example config into `./mdm`, prompts for the absolute path to your notes vault and saves it as `NOTES_ROOT` in `.env` — this is what gets mounted read-only into the containers, so it needs to point at your actual vault or the stack will start against an empty `./notes` folder instead — and creates `app.config.json` from the example. Then:

1. Double-check `mdm/.env` has `NOTES_ROOT` set to the absolute path of your notes vault.
2. Edit `mdm/app.config.json`:
   - set `obsidianVault` — needed for links to open notes in Obsidian to work correctly.
   - update `dateFormats` to match how dates appear in your notes — this is key to mdm's date filtering.
   - see [CONTRIBUTING.md](CONTRIBUTING.md#configuration) for the full field list (`views`, `habits`, `flags`, etc.).
3. `cd mdm && docker compose pull && docker compose up -d`
4. Open http://localhost

To update to newer images later, re-run `docker compose pull && docker compose up -d` from that same directory.

## Developing mdm

See [CONTRIBUTING.md](CONTRIBUTING.md) for running the apps from source, the full Docker Compose reference, and contribution guidelines.

