# (m)ark(d)own (m)emory
Markdown Memory (mdm) is for those of us who love markdown as a way to capture our thoughts, our journals, our experiences, our memories, photos, knowledge, and everything and anything else, but also acknowledge that the act of _reviewing_ and _reflecting_ on that markdown is very different than capturing it.

## Running mdm against your own notes

mdm ships as a set of published Docker images, so you can run it against your own notes vault (any folder of `.md`/`.markdown` files, such as an Obsidian vault) without cloning this repo or installing Node. From any directory:

```bash
curl -fsSL https://raw.githubusercontent.com/dannywieser/mdm/main/infra/docker/quickstart.sh | bash -s -- mdm
```

This downloads `docker-compose.yml` and an example config into `./mdm`, creates `app.config.json` and `.env` from it, and prompts for the path to your notes vault. Then:

1. Edit `mdm/app.config.json` — set at least `obsidianVault`, and review `dateFormats`, `views`, `habits`, and `flags` for your vault (see [CONTRIBUTING.md](CONTRIBUTING.md#configuration) for the full field list).
2. `cd mdm && docker compose pull && docker compose up -d`
3. Open http://localhost

To update to newer images later, re-run `docker compose pull && docker compose up -d` from that same directory.

## Developing mdm

See [CONTRIBUTING.md](CONTRIBUTING.md) for running the apps from source, the full Docker Compose reference, and contribution guidelines.

