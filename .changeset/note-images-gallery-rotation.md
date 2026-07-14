---
"markdown": minor
"notes-api": minor
"web": minor
---

Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and slowly rotates through a note's images (every 10 seconds) instead of showing a single static cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.
