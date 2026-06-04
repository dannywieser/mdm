import { Badge, Flex } from "@chakra-ui/react"

import type { Note } from "markdown"

import type { NoteBadgesProps } from "./NoteBadges.types"

const resolveBadgeValues = (note: Note, badge: string): string[] => {
  const value = badge.startsWith("frontmatter.")
    ? note.frontmatter?.[badge.replace("frontmatter.", "")]
    : note[badge as keyof Note]

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string")
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value]
  }

  return []
}

export const NoteBadges = ({ note, badges }: NoteBadgesProps) => {
  const resolvedBadges = badges.flatMap((badge) =>
    resolveBadgeValues(note, badge).map((value) => ({
      key: `${badge}:${value}`,
      value,
    })),
  )

  if (resolvedBadges.length === 0) {
    return null
  }

  return (
    <Flex gap="2" wrap="wrap">
      {resolvedBadges.map(({ key, value }) => (
        <Badge
          key={key}
          variant="subtle"
          bg="app.panelBackgroundHover"
          color="app.textMuted"
        >
          {value}
        </Badge>
      ))}
    </Flex>
  )
}
