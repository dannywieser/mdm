# transaction-tracker

Express-based API that reads transactions out of note frontmatter and returns
the ones falling inside a requested window — both the one-off transactions a
note records as having happened, and the occurrences projected from recurring
notes' schedules.

Scheduled transactions have **no end horizon**. Occurrences are generated on
demand for whatever window a request asks for, so a rule anchored years ago
still resolves in a month decades ahead at the same cost as the current month.
Nothing is precomputed and nothing is capped at a fixed number of months.

## Endpoints

- `GET /health`
  - Purpose: verifies the vault directory (`NOTES_ROOT`) is readable. Only checked when `notesSource` is `"obsidian"` — in `"bear"` mode there is no vault to check, so this only verifies config resolves.
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when config can't be resolved, or (in `"obsidian"` mode only) the vault directory isn't readable
    ```json
    { "status": "error", "error": "ENOENT: no such file or directory, access '/data/notes'" }
    ```

- `GET /transactions`
  - Purpose: return every transaction occurrence in a date window, with the window's totals.
  - Query parameters (all optional):
    - `month=YYYY-MM` — shorthand for that whole calendar month. This is what the web calendar uses.
    - `from=YYYY-MM-DD&to=YYYY-MM-DD` — an explicit inclusive window. Both must be given together.
    - Neither — defaults to the month containing today (in the configured `timezone`).
  - `amount` is signed: negative is money out, positive is money in.
  - `status` is `"logged"` for a note that records a transaction directly, and `"scheduled"` for an occurrence projected from a note's `recurrence`. Past occurrences of a recurring note stay `"scheduled"` — the status says where the entry came from, not whether its date has passed.
  - `id` is unique per occurrence (`<noteId>:<date>`) so repeats of one note don't collide; `noteId` matches the id `notes-api` gives the same note, so a client can link an occurrence back to its source note.
  - When `notesSource` is `"obsidian"`, notes are scanned from the filesystem vault (`NOTES_ROOT`). When `notesSource` is `"bear"`, notes are loaded from the `notes:bear` Redis hash that `notes-ingest` populates — the results are identical either way.
  - Success response: `200`
    ```json
    {
      "currency": "USD",
      "from": "2026-08-01",
      "to": "2026-08-31",
      "totals": {
        "expense": -2019.17,
        "income": 5085,
        "logged": 35.31,
        "net": 3065.83,
        "scheduled": 3030.52
      },
      "transactions": [
        {
          "amount": -1650,
          "category": "housing",
          "date": "2026-08-01",
          "description": "Rent",
          "id": "8f3c1d2e-...:2026-08-01",
          "noteId": "8f3c1d2e-...",
          "obsidianUrl": "obsidian://open?vault=notes&file=finance%2Frent",
          "recurrence": "monthly",
          "status": "scheduled"
        },
        {
          "amount": -22.99,
          "category": "books",
          "date": "2026-08-04",
          "description": "Paperback",
          "id": "b1a0f5c7-...:2026-08-04",
          "noteId": "b1a0f5c7-...",
          "obsidianUrl": "obsidian://open?vault=notes&file=finance%2Fpaperback",
          "recurrence": null,
          "status": "logged"
        }
      ]
    }
    ```
  - Error response: `400` when the requested window is malformed
    ```json
    { "error": "month must be a YYYY-MM value" }
    ```
    Also returned for `to` earlier than `from`, a non-ISO `from`/`to`, or only one of the pair.
  - Error response: `500` when the vault can't be scanned
    ```json
    { "error": "Unable to load transactions" }
    ```
  - Sample curl commands:
    ```bash
    curl "http://localhost/transactions?month=2026-08"
    curl "http://localhost/transactions?from=2026-08-01&to=2026-09-30"
    ```

## How a note becomes a transaction

Any note carrying a numeric value in the configured `amountProperty` is a
transaction. Everything else about it is optional:

```markdown
---
amount: -1650.00
date: 2026-01-01
description: Rent
category: housing
recurrence: monthly
---
```

- **amount** (required) — signed. `-1650`, `$1,200.50`, and `(45)` (accounting-style negative) all parse; a value with nothing numeric left after stripping symbols excludes the note rather than failing the scan.
- **date** — the transaction's date, or a schedule's first occurrence. Falls back to the note's own date (the `createdDateProperty`, then a date parsed from the title via `dateFormats`) when absent, so a daily-note vault needs no explicit date.
- **description** — falls back to the note's title.
- **category** — free-form; passed through untouched.
- **recurrence** — presence makes the note a schedule. An unrecognised value degrades to a single logged transaction rather than failing.
- **recurrenceEnd** — inclusive last date the rule may occur on. Omit it for a schedule that never ends.

### Recurrence rules

Named rules: `daily`, `weekly`, `biweekly` / `fortnightly`, `monthly`,
`quarterly`, `semiannually`, `yearly` / `annually` / `annual`. Matching is
case-insensitive.

Interval form: `every <n> <unit>`, where unit is `day(s)`, `week(s)`,
`month(s)`, or `year(s)` — for example `every 2 weeks` or `every 18 months`.
The count is optional, so `every month` means the same as `monthly`.

Month- and year-based rules clamp to the end of shorter months rather than
rolling into the next one: a schedule anchored on the 31st occurs on Feb 28
(or 29 in a leap year) and then returns to the 31st, instead of drifting
forward a day each time.

A single rule returns at most 1000 occurrences per request, so an unusually
wide `from`/`to` range on a daily rule can't force an unbounded response. A
month-at-a-time request is far below that ceiling.

## Configuration

Reads `app.config.json` (see [`packages/app-config`](../../packages/app-config/README.md)).
The optional `transactions` block names the frontmatter properties to read;
every field has a default, so a vault already using the conventional names
needs no configuration at all:

```json
{
  "transactions": {
    "amountProperty": "amount",
    "categoryProperty": "category",
    "currency": "USD",
    "dateProperty": "date",
    "descriptionProperty": "description",
    "folder": "finance",
    "recurrenceEndProperty": "recurrenceEnd",
    "recurrenceProperty": "recurrence"
  }
}
```

- `folder` restricts the scan to one vault-relative directory (and everything
  under it). The default, `""`, scans the whole vault. A sibling folder that
  merely shares the name as a prefix is not matched — `finance` does not pull
  in `financial`.
- `currency` is an ISO 4217 code, returned in the response for the UI to
  format amounts with. It does not convert anything.

### Environment variables

| Variable          | Default                  | Purpose                                                     |
| ----------------- | ------------------------ | ----------------------------------------------------------- |
| `APP_CONFIG_PATH` | `./app.config.json`      | Location of the app config file.                             |
| `NOTES_ROOT`      | _(required)_             | Absolute path to the vault. Not required in `"bear"` mode.   |
| `PORT`            | `3006`                   | Port the service listens on.                                 |
| `REDIS_URL`       | `redis://localhost:6379` | Only used when `notesSource` is `"bear"`.                    |

## Structure

- `src/server.ts` — server, middleware, and route setup only; no business logic.
- `src/handlers/health/` — vault readability check.
- `src/handlers/transactions/` — the endpoint, split into the window resolver
  (`transactions.range.ts`), the note scanners for each source
  (`transactions.files.ts`, `transactions.bear.ts`), the frontmatter-to-
  occurrence logic (`transactions.util.ts`), the folder filter
  (`transactionsFolder.ts`), and the window summary (`transactions.totals.ts`).
- `src/recurrence/` — rule parsing (`parseRecurrence.ts`) and the horizon-free
  projection (`expandRecurrence.ts`).

## Scripts

```bash
npm run dev --workspace transaction-tracker
npm run build --workspace transaction-tracker
npm run test --workspace transaction-tracker
```
