---
"app-config": minor
---

Refactor app-config package: remove directory traversal in favour of APP_CONFIG_PATH env var, remove AppConfigError, remove HomeStatsShowConfig, extract per-key validators into focused modules with dedicated tests, and move validateAppConfig to its own file with per-property validate functions.
