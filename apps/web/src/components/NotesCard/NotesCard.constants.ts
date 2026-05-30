import type { Config as DOMPurifyConfig } from "dompurify"

// Extends DOMPurify's default allowed protocols to include obsidian:// deep links.
export const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|obsidian):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
}
