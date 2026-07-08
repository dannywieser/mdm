---
"web": patch
---

Fix client-side route navigation (e.g. clicking into `/stats`) hanging on the previous page and then swapping to the new one fully loaded, with no visible loading transition — React Router v7's `<BrowserRouter>` wraps navigations in `React.startTransition` by default, which suppresses Suspense fallbacks on already-mounted routes; disable that (`useTransitions={false}`) so the app's loading screen shows immediately during navigation, as it already does on first load.

Also truly parallelize the stats page's meta and history requests via a new combined `useStatsPageData` hook (built on `useSuspenseQueries`) instead of two separate `useSuspenseQuery` calls in the same component — the latter still serializes the requests, since React aborts the render (and never reaches the second hook call) as soon as the first one suspends.

And change the contribution graph's shading to scale relative to a typical day (median-based, with a floor of 30) rather than the all-time max, flagging days more than 5x the median — and at least 30 — as outliers. Outliers get their own graduated highlight color (rather than one flat color) so a mild outlier reads lighter than an extreme one, and ordinary usage growth from a low baseline isn't misflagged.

Finally, tighten up the activity graph's layout: smaller day cells, tighter spacing between rows, and a fix for an unrelated line-height quirk that was inflating each row's height well beyond its cell size.
