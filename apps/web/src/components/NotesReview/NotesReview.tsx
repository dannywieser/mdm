import { useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react"
import { BookCheck, ChevronRight, ExternalLink } from "lucide-react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useToggleNoteRead } from "../../hooks/useToggleNoteRead/useToggleNoteRead"
import { fetchIsRead } from "../../hooks/useIsRead/useIsRead"
import { useI18n } from "../../i18n"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import type { NotesReviewRouteParamKey } from "./NotesReview.types"
import { MarkdownTree } from "../MarkdownTree/MarkdownTree"
import { AppError } from "../AppError/AppError"
import { ReadNotesMobileTrigger, ReadNotesSidebar } from "./ReadNotesPanel"

export const NotesReview = () => {
  const { view } = useParams<NotesReviewRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()
  const [currentIndex, setCurrentIndex] = useState(0)

  const notes = data?.notes ?? []
  const currentNote = notes[currentIndex]
  const toggleRead = useToggleNoteRead({ noteId: currentNote?.id ?? "" })

  const readStates = useQueries({
    queries: notes.map((note) => ({
      queryKey: ["note-read", note.id],
      queryFn: () => fetchIsRead(note.id),
      enabled: note.id.trim().length > 0,
    })),
  })

  const readNotes = notes.filter((_, i) => readStates[i]?.data === true)

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
    <Flex align="flex-start" gap="0">
      <ReadNotesSidebar notes={readNotes} />

      <VStack align="stretch" flex="1" gap="6" minWidth="0" p="6">
        <Flex align="center" justify="space-between">
          <Text color="fg.muted" fontSize="sm">
            {t("review.progress", {
              current: currentIndex + 1,
              total: notes.length,
            })}
          </Text>
          <ReadNotesMobileTrigger notes={readNotes} />
        </Flex>

        <MarkdownTree content={currentNote.content} />
        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          gap="2"
          justify="flex-end"
        >
          <Button
            asChild
            colorPalette="purple"
            variant="ghost"
            width={{ base: "full", sm: "auto" }}
          >
            <a href={currentNote.obsidianUrl}>
              <ExternalLink size={16} />
              {t("review.openInObsidian")}
            </a>
          </Button>
          <Button
            variant="ghost"
            width={{ base: "full", sm: "auto" }}
            onClick={advance}
          >
            <ChevronRight size={16} />
            {t("review.skip")}
          </Button>
          <Button
            colorPalette="green"
            width={{ base: "full", sm: "auto" }}
            onClick={handleMarkAsRead}
            loading={toggleRead.isPending}
          >
            <BookCheck size={16} />
            {t("notes.markAsRead")}
          </Button>
        </Flex>
      </VStack>
    </Flex>
  )
}
