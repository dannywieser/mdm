---
"web": patch
---

Fixed the notes review screen showing a note's title twice for Bear-sourced notes: Bear embeds the title as an H1 in the note body, which was rendered directly beneath the page's own title heading. The page-level title is now hidden whenever a note's content already opens with an H1.
