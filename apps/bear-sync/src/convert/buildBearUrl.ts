/** Builds a `bear://x-callback-url/open-note` deep link for a note, Bear's analog of Obsidian's `obsidian://open` url. */
export const buildBearUrl = (id: string): string =>
  `bear://x-callback-url/open-note?id=${encodeURIComponent(id)}`
