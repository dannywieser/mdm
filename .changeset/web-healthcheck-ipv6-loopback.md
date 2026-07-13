---
"web": patch
---

Fix the web container's Docker healthcheck always reporting unhealthy: it hit "localhost", which resolves to the IPv6 loopback that nginx doesn't bind, so the check now targets 127.0.0.1 directly.

