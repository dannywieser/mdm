import { useState } from "react"
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react"
import { BookCheck, ChevronRight } from "lucide-react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useToggleNoteRead } from "../../hooks/useToggleNoteRead/useToggleNoteRead"
import { useI18n } from "../../i18n"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import type { NotesReviewRouteParamKey } from "./NotesReview.types"
import { MarkdownTree } from "../MarkdownTree/MarkdownTree"
import { AppError } from "../AppError/AppError"

export const NotesReview = () => {
  const { view } = useParams<NotesReviewRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()
  const [currentIndex, setCurrentIndex] = useState(0)

  const notes = data?.notes ?? []
  const currentNote = notes[currentIndex]
  const toggleRead = useToggleNoteRead({ noteId: currentNote?.id ?? "" })

  const advance = () => setCurrentIndex((i) => i + 1)

  const handleMarkAsRead = () => {
    toggleRead.mutate(undefined, { onSuccess: advance })
  }

  if (isLoading) {
    return (
      <VStack align="center" gap={6} pt={16}>
        <Box color="gray.300">
          <NotebookIcon animating={isLoading} size={80} />
        </Box>
      </VStack>
    )
  }

  if (error) {
    return <AppError message={t("notes.errorTitle")} />
  }

  if (!notes.length || currentIndex >= notes.length) {
    return (
      <VStack p="6">
        <Text fontSize="lg" fontWeight="semibold">
          {t("review.allCaughtUp")}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" gap="6" p="6">
      <Text color="fg.muted" fontSize="sm">
        {t("review.progress", {
          current: currentIndex + 1,
          total: notes.length,
        })}
      </Text>
      <MarkdownTree content={currentNote.content} />
      <Flex gap="2" justify="flex-end">
        <Button variant="ghost" onClick={advance}>
          <ChevronRight size={16} />
          {t("review.skip")}
        </Button>
        <Button
          colorPalette="green"
          onClick={handleMarkAsRead}
          loading={toggleRead.isPending}
        >
          <BookCheck size={16} />
          {t("notes.markAsRead")}
        </Button>
      </Flex>
    </VStack>
  )
}
