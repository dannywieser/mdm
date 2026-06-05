---
"web": patch
---

Fix viewport height on mobile Safari (iPad): replace `100vh` with `100dvh` so the app shell correctly accounts for browser chrome. Also switch the root layout from a fixed-height overflow container to a natural-scroll `min-height` container, which improves scroll behaviour on iOS.
