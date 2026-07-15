import { Link } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

import { useNoteLink } from "../../hooks/useNoteLink/useNoteLink"
import type { NoteLinkProps } from "./NoteLink.types"

/**
 * A note title/card link that opens the real obsidian:// deep link, or in
 * demo mode navigates to the in-app note-source route instead.
 */
export const NoteLink = ({ note, children, ...linkProps }: NoteLinkProps) => {
  const { href, isDemo } = useNoteLink(note)

  if (isDemo) {
    return (
      <Link asChild {...linkProps}>
        <RouterLink to={href}>{children}</RouterLink>
      </Link>
    )
  }

  return (
    <Link href={href} {...linkProps}>
      {children}
    </Link>
  )
}
