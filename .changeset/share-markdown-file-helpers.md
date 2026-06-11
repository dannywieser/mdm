---
"markdown": minor
"notes-api": patch
"habit-tracker": patch
---

Moved shared markdown file-loading helpers (`collectMarkdownFiles`, `buildObsidianUrl`, `resolveDateFromFrontmatterOrTitle`) into the `markdown` package and updated `notes-api` and `habit-tracker` to use them, removing duplicated implementations.
