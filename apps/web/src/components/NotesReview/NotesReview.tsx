import { useEffect, useRef, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react"
import { BookCheck } from "lucide-react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useToggleNoteRead } from "../../hooks/useToggleNoteRead/useToggleNoteRead"
import { fetchIsRead } from "../../hooks/useIsRead/useIsRead"
import { usePageTitle } from "../../context/PageTitle/PageTitle"
import { useI18n } from "../../i18n"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import type { NotesReviewRouteParamKey } from "./NotesReview.types"
import { MarkdownTree } from "../MarkdownTree/MarkdownTree"
import { AppError } from "../AppError/AppError"
import { ReadNotesMobileTrigger, ReadNotesSidebar } from "./ReadNotesPanel"
import { OpenInObsidianButton } from "../OpenInObsidianButton/OpenInObsidianButton"

export const NotesReview = () => {
  const { view } = useParams<NotesReviewRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()
  const [currentIndex, setCurrentIndex] = useState(0)
  const initialized = useRef(false)

  const notes = data?.notes ?? []
  const currentNote = notes[currentIndex]
  const toggleRead = useToggleNoteRead({ noteId: currentNote?.id ?? "" })

  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(currentNote?.title ?? "")
    return () => setTitle("")
  }, [currentNote?.title, setTitle])

  const readStates = useQueries({
    queries: notes.map((note) => ({
      queryKey: ["note-read", note.id],
      queryFn: () => fetchIsRead(note.id),
      enabled: note.id.trim().length > 0,
    })),
  })

  const allReadStatesSettled =
    readStates.length > 0 && readStates.every((s) => s.status !== "pending")

  useEffect(() => {
    if (initialized.current || !allReadStatesSettled) return
    initialized.current = true
    const firstUnread = notes.findIndex((_, i) => readStates[i]?.data !== true)
    setCurrentIndex(firstUnread === -1 ? notes.length : firstUnread)
  }, [allReadStatesSettled, notes, readStates])

  const readNotes = notes.filter((_, i) => readStates[i]?.data === true)

  const handleMarkAsRead = () => {
    toggleRead.mutate(undefined, {
      onSuccess: () => setCurrentIndex((i) => i + 1),
    })
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

      <VStack align="stretch" flex="1" gap="2" minWidth="0" p="4">
        <Flex align="center" justify="space-between">
          <Text color="fg.muted" fontSize="sm">
            {t("review.progress", {
              current: currentIndex + 1,
              total: notes.length,
            })}
          </Text>
          <Flex gap="1">
            <OpenInObsidianButton note={currentNote} />
            <ReadNotesMobileTrigger notes={readNotes} />
          </Flex>
        </Flex>

        <MarkdownTree content={currentNote.content} />
        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          gap="2"
          justify="flex-end"
        >
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
