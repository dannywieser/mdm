---
"web": patch
---

Fix `NotesGalleryByMonth` and `NotesGalleryByYear` dropping notes that lack a `createdDate`, by falling back to `modifiedDate` for grouping.
