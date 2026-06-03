import { IconButton } from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"

import type { OpenInObsidianButtonProps } from "./OpenInObsidianButton.types"

export const OpenInObsidianButton = ({ note }: OpenInObsidianButtonProps) => (
  <IconButton
    asChild
    aria-label="Open in Obsidian"
    size="md"
    title="Open in Obsidian"
    variant="subtle"
    colorPalette="purple"
  >
    <a href={note.obsidianUrl}>
      <ExternalLink size={16} />
    </a>
  </IconButton>
)
