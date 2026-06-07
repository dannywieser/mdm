---
"habit-tracker": patch
---

Change `history` in the `GET /habit/:id` response to include one record for every calendar day from the first matching note through today (rather than only days with a logged entry), so it can be plotted as a continuous score-over-time graph. Days with no logged entry have `value: 0` and a score computed normally as of that day. Each `history` entry now also includes `streak`, the streak as of that day.
