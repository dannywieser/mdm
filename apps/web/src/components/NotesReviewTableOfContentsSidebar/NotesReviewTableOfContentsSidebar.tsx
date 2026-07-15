import { Text, VStack } from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { NoteLink } from "../NoteLink"
import type { NotesReviewTableOfContentsProps } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.types"
import { getNoteColor } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.util"

export const NotesReviewTableOfContentsSidebar = ({
  notes,
  currentIndex,
}: NotesReviewTableOfContentsProps) => {
  const { t } = useI18n()

  return (
    <VStack
      align="stretch"
      borderRight="1px solid"
      borderColor="app.border"
      display={{ base: "none", sm: "flex" }}
      flexShrink={0}
      gap="1"
      minWidth="0"
      p="4"
      width="200px"
    >
      {notes.length > 0 && (
        <VStack align="stretch" gap="1">
          <Text
            color="app.textMuted"
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="wide"
            mb="1"
          >
            {t("review.forReview", { count: notes.length })}
          </Text>
          {notes.map((note, i) => (
            <NoteLink
              key={note.id}
              note={note}
              display="block"
              color={getNoteColor(i === currentIndex, note.isRead)}
              fontWeight={i === currentIndex || !note.isRead ? "bold" : undefined}
              fontSize={i === currentIndex ? "sm" : "xs"}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              textDecoration="none"
              {...focusRing}
            >
              {note.title}
            </NoteLink>
          ))}
        </VStack>
      )}
    </VStack>
  )
}
