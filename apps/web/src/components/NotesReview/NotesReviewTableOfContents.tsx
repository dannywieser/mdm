import { Drawer, IconButton, Text, VStack } from "@chakra-ui/react"
import { BookCheck, X } from "lucide-react"

import { useI18n } from "../../i18n"

import type { NotesReviewTableOfContentsProps } from "./NotesReviewTableOfContents.types"

const TocList = ({ notes, currentIndex }: NotesReviewTableOfContentsProps) => {
  const { t } = useI18n()

  return (
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
        <Text
          key={note.id}
          color={
            i === currentIndex
              ? "app.accent"
              : note.isRead
                ? "app.textMuted"
                : undefined
          }
          fontWeight={i === currentIndex || !note.isRead ? "bold" : undefined}
          fontSize="xs"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {note.title}
        </Text>
      ))}
    </VStack>
  )
}

export const NotesReviewTableOfContentsSidebar = ({
  notes,
  currentIndex,
}: NotesReviewTableOfContentsProps) => (
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
    {notes.length > 0 && <TocList notes={notes} currentIndex={currentIndex} />}
  </VStack>
)

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
              <IconButton aria-label={t("review.close")} variant="ghost">
                <X size={16} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body>
            <VStack align="stretch" gap="3">
              {notes.map((note, i) => (
                <Text
                  key={note.id}
                  color={
                    i === currentIndex
                      ? "app.accent"
                      : note.isRead
                        ? "app.textMuted"
                        : undefined
                  }
                  fontWeight={
                    i === currentIndex || !note.isRead ? "bold" : undefined
                  }
                  fontSize="sm"
                >
                  {note.title}
                </Text>
              ))}
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
