---
"bear-sync": patch
---

`bear-sync` now removes the temp directory it copies Bear's database into after every run (success or failure), instead of leaking a fresh copy of the entire Bear database on every sync.
