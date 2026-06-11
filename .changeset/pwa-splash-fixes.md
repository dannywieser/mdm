---
"web": patch
---

Fix the PWA startup splash so the page background reverts to the user's selected color palette after the app mounts (it was previously stuck on the static splash background due to CSS `@layer` priority), and fix the loading icon briefly appearing oversized and right-aligned before centering.
