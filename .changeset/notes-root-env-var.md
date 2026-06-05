---
"app-config": minor
---

`noteRootDirectory` has been removed from `app.config.json` entirely. The notes directory is now configured exclusively via the `NOTES_ROOT` environment variable. The `imagesRoot` config key has also been removed as it was unused — the image-server already reads `IMAGES_ROOT` from the environment.
