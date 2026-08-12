---
"markdown": minor
"notes-api": minor
---

A note's raw body is now also scanned for plain `[label](url)` links whose destination looks like an image file by extension (Bear's inline-image-preview format, e.g. `[3h6HmH](https://images.example.com/i/3h6HmH.jpg)`), in addition to the existing `![alt](path)` and `![[path]]` syntaxes. Matching images are added to `frontmatter.images` the same as any other image, and in `content` the link is rendered as an inline `image` node (`alt` taken from the link text) instead of a plain `link` node. A `[label](url)` link whose destination isn't recognized as an image is left as a normal `link` node.

`markdown` exports a new `isImageUrl(url)` helper for this extension-based check.
