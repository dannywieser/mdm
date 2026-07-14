---
"web": patch
---

Fixed `FadeImage` to omit the `src` attribute entirely instead of rendering `<img src="">` when there's no valid image to show — an empty `src` attribute causes browsers to issue an unintended request for the current document URL.
