---
"web": patch
---

Fix the contribution graph's hover tooltip rendering all lines squished and overlapping on the stats page — the day cell's `lineHeight={0}` (used to keep grid cells tight) was inherited by the tooltip's text, collapsing every line's height to zero. Also drop the redundant "unusually high" outlier note from the visual tooltip, since the orange coloring already conveys it; it's still available in the legend and in the day cell's `aria-label` for screen reader users.
