---
"web": patch
---

Fix the stats page's activity graph and meta stats fetching in parallel instead of serially, so navigating to `/stats` shows a single loading transition instead of a delayed, flicker-prone one. Also change the contribution graph's shading to scale relative to a typical day (median-based, with a floor of 30) rather than the all-time max, flagging days more than 5x the median — and at least 30 — as outliers. Outliers get their own graduated highlight color (rather than one flat color) so a mild outlier reads lighter than an extreme one, and ordinary usage growth from a low baseline isn't misflagged.
