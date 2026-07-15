---
"web": patch
---

Fix note links that bypassed demo mode: the table-of-contents sidebar/drawer, review-complete list, notes summary table, and gallery cards now redirect to the in-app note-source view instead of an unusable `obsidian://` link when running the demo, matching the existing NotesReview behavior. (The habit detail chart's date links still point at `obsidian://` in demo mode — its data has no note id to redirect with, which needs a habit-tracker API change to fix.)
