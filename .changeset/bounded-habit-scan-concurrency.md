---
"mdm-util": minor
"habit-tracker": patch
---

Fix `EMFILE: too many open files` errors when scanning large vaults: `mdm-util` gains `mapWithConcurrency`, and `habit-tracker` uses it to bound concurrent note reads while scanning habit entries (previously every note was opened at once per habit).
