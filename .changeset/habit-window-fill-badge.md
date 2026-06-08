---
"web": patch
"habit-tracker": patch
---

Add a percentage badge next to "days logged" on the habit detail page showing how full the current tracking window is (logged days / window size). The `/habit/:id` response now includes `trackingWindowDays` to support this.
