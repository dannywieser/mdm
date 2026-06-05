---
"app-config": minor
---

`noteRootDirectory` is no longer required in `app.config.json`. Set the `NOTES_ROOT` environment variable instead (env var takes precedence if both are provided). The `imagesRoot` config key has been removed as it was unused — the image-server already reads `IMAGES_ROOT` from the environment.
