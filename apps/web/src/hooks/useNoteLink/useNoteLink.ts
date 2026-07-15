import { isDemoMode } from "services"

import type { UseNoteLinkOptions, UseNoteLinkResult } from "./useNoteLink.types"

/**
 * Resolves where a note's "open" link should point: the demo's note-source
 * route when running in demo mode (there's no real Obsidian vault to open),
 * or the real obsidian:// deep link otherwise.
 */
export function useNoteLink({ id, obsidianUrl }: UseNoteLinkOptions): UseNoteLinkResult {
  const isDemo = isDemoMode()
  return {
    href: isDemo ? `/source/${encodeURIComponent(id)}` : obsidianUrl,
    isDemo,
  }
}
