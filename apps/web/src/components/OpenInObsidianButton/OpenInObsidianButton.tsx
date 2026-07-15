import { IconButton } from "@chakra-ui/react"
import { ExternalLink, FileCode } from "lucide-react"
import { Link } from "react-router-dom"

import { useNoteLink } from "../../hooks/useNoteLink/useNoteLink"
import { focusRing } from "../../theme/focusRing"
import type { OpenInObsidianButtonProps } from "./OpenInObsidianButton.types"

const buttonStyleProps = {
  size: "md",
  variant: "ghost",
  color: "app.accent",
  bg: "app.panelBackground",
  _hover: { bg: "app.panelBackgroundHover" },
  ...focusRing,
} as const

export const OpenInObsidianButton = ({ note }: OpenInObsidianButtonProps) => {
  const { href, isDemo } = useNoteLink(note)

  // The demo has no Obsidian vault behind it, so show the note's markdown
  // source in the browser instead of an obsidian:// deep link.
  if (isDemo) {
    return (
      <IconButton
        asChild
        aria-label="View note source"
        title="View note source"
        {...buttonStyleProps}
      >
        <Link to={href}>
          <FileCode size={16} />
        </Link>
      </IconButton>
    )
  }

  return (
    <IconButton
      asChild
      aria-label="Open in Obsidian"
      title="Open in Obsidian"
      {...buttonStyleProps}
    >
      <a href={href}>
        <ExternalLink size={16} />
      </a>
    </IconButton>
  )
}
