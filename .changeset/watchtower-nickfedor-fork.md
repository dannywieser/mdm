---
"notes-api": patch
"flag-manager": patch
"habit-tracker": patch
"image-server": patch
"stats-service": patch
"web": patch
---

Switches the opt-in `watchtower` Compose service from `containrrr/watchtower` to `nickfedor/watchtower`, the actively maintained fork. The original image was archived unmaintained in December 2025 and fails against Docker Engine v29+ hosts with `client version 1.25 is too old`, since it ships a Docker client that predates the daemon's new minimum supported API version.
