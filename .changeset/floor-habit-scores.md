---
"habit-tracker": patch
---

Floor `GET /habit/:id` scores (current score and history scores) to whole numbers, correcting for floating-point representation noise so values like `524.9999999999999` floor to the mathematically exact `525` rather than `524`.
