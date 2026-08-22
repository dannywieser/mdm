---
"app-config": minor
"markdown": minor
"mdm-util": minor
"notes-api": minor
"web": minor
---

Add a transaction calendar: a new `transaction-tracker` service reads transactions from note frontmatter and serves `GET /transactions` for a requested month or date range, returning both logged transactions and occurrences projected from recurring notes' schedules, plus window totals. Recurrences are expanded on demand with no end horizon, so any future month resolves. The web app gains `/calendar` and `/calendar/:month`, a month grid listing each day's transactions with in/out/net totals and links back to the source notes.
