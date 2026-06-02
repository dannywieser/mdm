import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify"

const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|obsidian):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
}

export const sanitizeNoteHtml = (html: string) =>
  DOMPurify.sanitize(html, SANITIZE_CONFIG)
