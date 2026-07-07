---
"notes-api": patch
"flag-manager": patch
"habit-tracker": patch
"image-server": patch
"stats-service": patch
"web": patch
---

The new Trivy scan gate (added in a prior change) was failing on every push: Alpine OS packages (`libcrypto3`/`libssl3`, `musl`, `zlib`) with unpatched known CVEs, plus a full set of HIGH-severity CVEs in packages that turned out to be npm's own bundled dependencies (`glob`, `minimatch`, `tar`, `sigstore`, etc. at `/usr/local/lib/node_modules/npm`), not anything from the apps' own dependency trees. Each Dockerfile's runner stage now runs `apk upgrade` for the latest available OS patches and removes the base image's bundled `npm`/`npx`/`corepack`, since none of these images ever invoke npm at runtime (the container only runs `node dist/server.js`).
