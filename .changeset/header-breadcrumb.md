---
"web": patch
---

Replace the header title with a Chakra breadcrumb: on `/notes/:view` it shows `mdm > <view name>` with "mdm" linking home; on the home route it shows just "mdm". Removes the PageTitle context that was previously used to push the current note title into the header from NotesReview.
