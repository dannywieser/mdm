---
"notes-api": minor
"web": minor
---

Add a dedicated `GET /views` endpoint that lists configured views along with the matching note IDs and counts, and remove the `views` property from the `/stats` response. The web app now fetches views from the new endpoint.
