---
"habit-tracker": patch
---

Fix `EMFILE: too many open files` errors when scanning large vaults: habit entry scanning now reads note files with bounded concurrency (via `mapWithConcurrency` from `mdm-util`) instead of opening every note at once per habit.
