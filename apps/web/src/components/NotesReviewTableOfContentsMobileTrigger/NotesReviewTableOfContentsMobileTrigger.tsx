import { Drawer, IconButton, Text, VStack } from "@chakra-ui/react"
import { BookCheck, X } from "lucide-react"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { NoteLink } from "../NoteLink"
import type { NotesReviewTableOfContentsProps } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.types"
import { getNoteColor } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.util"

export const NotesReviewTableOfContentsMobileTrigger = ({
  notes,
  currentIndex,
}: NotesReviewTableOfContentsProps) => {
  const { t } = useI18n()

  if (notes.length === 0) return null

  return (
    <Drawer.Root placement="bottom" size="full">
      <Drawer.Trigger asChild>
        <IconButton
          aria-label={t("review.forReview", { count: notes.length })}
          color="app.successBackground"
          display={{ base: "flex", sm: "none" }}
          size="sm"
          variant="ghost"
          _hover={{ bg: "app.panelBackgroundHover" }}
          {...focusRing}
        >
          <BookCheck size={16} />
          <Text fontSize="xs" ml="1">
            {currentIndex + 1}/{notes.length}
          </Text>
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content bg="app.background" color="app.text">
          <Drawer.Header>
            <Drawer.Title>
              {t("review.forReview", { count: notes.length })}
            </Drawer.Title>
            <Drawer.CloseTrigger asChild>
              <IconButton
                aria-label={t("review.close")}
                variant="ghost"
                {...focusRing}
              >
                <X size={16} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body>
            <VStack align="stretch" gap="3">
              {notes.map((note, i) => (
                <NoteLink
                  key={note.id}
                  note={note}
                  color={getNoteColor(i === currentIndex, note.isRead)}
                  fontWeight={
                    i === currentIndex || !note.isRead ? "bold" : undefined
                  }
                  fontSize="sm"
                  textDecoration="none"
                  {...focusRing}
                >
                  {note.title}
                </NoteLink>
              ))}
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
