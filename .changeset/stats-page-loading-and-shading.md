---
"web": patch
---

Fix client-side route navigation (e.g. clicking into `/stats`) hanging on the previous page and then swapping to the new one fully loaded, with no visible loading transition — React Router v7's `<BrowserRouter>` wraps navigations in `React.startTransition` by default, which suppresses Suspense fallbacks on already-mounted routes; disable that (`useTransitions={false}`) so the app's loading screen shows immediately during navigation, as it already does on first load.

Also fix the stats page's activity graph and meta stats fetching in parallel instead of serially, removing a secondary loading stall specific to `/stats`. And change the contribution graph's shading to scale relative to a typical day (median-based, with a floor of 30) rather than the all-time max, flagging days more than 5x the median — and at least 30 — as outliers. Outliers get their own graduated highlight color (rather than one flat color) so a mild outlier reads lighter than an extreme one, and ordinary usage growth from a low baseline isn't misflagged.
