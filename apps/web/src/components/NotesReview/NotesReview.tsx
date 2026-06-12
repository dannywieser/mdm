import { useEffect, useMemo, useRef, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { BookCheck } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { fetchIsRead, useNotesQuery, useToggleRead } from "services"

import { useI18n } from "../../i18n"

import type { NotesReviewRouteParamKey } from "./NotesReview.types"
import { LinkedNotesList } from "../LinkedNotesList"
import { MarkdownTree } from "../MarkdownTree"
import { NoteBadges } from "../NoteBadges"
import {
  NotesReviewTableOfContentsMobileTrigger,
  NotesReviewTableOfContentsSidebar,
} from "./NotesReviewTableOfContents"
import { OpenInObsidianButton } from "../OpenInObsidianButton"
import { NotebookIcon } from "../NotebookIcon"
import type { NotesReviewProps } from "./NotesReview.types"

const reviewItemIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

export const NotesReview = ({ badges = [] }: NotesReviewProps) => {
  const { view } = useParams<NotesReviewRouteParamKey>()
  const { data } = useNotesQuery({ view })
  const { t } = useI18n()
  // -1 means "not yet initialized" — keeps LoadingScreen visible until the
  // first-unread position is known, preventing a flash of note 0.
  const [currentIndex, setCurrentIndex] = useState(-1)
  const initialized = useRef(false)
  const contentTopRef = useRef<HTMLDivElement>(null)

  const notes = useMemo(() => data.notes, [data.notes])
  const currentNote = notes[currentIndex] as (typeof notes)[number] | undefined
  const toggleRead = useToggleRead({ noteId: currentNote?.id ?? "" })

  useEffect(() => {
    if (currentIndex < 0) return
    contentTopRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    })
  }, [currentIndex])

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

  const tocNotes = notes.map((note, i) => ({
    id: note.id,
    obsidianUrl: note.obsidianUrl,
    title: note.title,
    isRead: readStates[i]?.data === true,
  }))

  const handleMarkAsRead = () => {
    toggleRead.mutate(undefined, {
      onSuccess: () => setCurrentIndex((i) => i + 1),
    })
  }

  const isLoading = notes.length > 0 && currentIndex === -1

  const reviewedNotes = notes.filter((_, i) => readStates[i]?.data === true)

  if (isLoading || !notes.length || currentIndex >= notes.length) {
    return (
      <VStack p="6" pt={16}>
        <Box color="app.iconMuted">
          <NotebookIcon animating={isLoading} size={80} />
        </Box>
        {!isLoading && (
          <>
            {reviewedNotes.length > 0 && (
              <VStack align="center" gap="1" mt="4">
                {reviewedNotes.map((note, i) => (
                  <Text
                    key={note.id}
                    color="fg.muted"
                    fontSize="sm"
                    css={{
                      animation: `${reviewItemIn} 0.25s ease forwards`,
                      animationDelay: `${i * 0.06}s`,
                      opacity: 0,
                    }}
                  >
                    <a
                      href={note.obsidianUrl}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {note.title}
                    </a>
                  </Text>
                ))}
              </VStack>
            )}
            <Text
              fontSize="lg"
              fontWeight="semibold"
              css={{
                animation: `${reviewItemIn} 0.25s ease forwards`,
                animationDelay: `${reviewedNotes.length * 0.06 + 0.1}s`,
                opacity: 0,
              }}
            >
              {t("review.complete")}
            </Text>
            <Text
              fontSize="sm"
              css={{
                animation: `${reviewItemIn} 0.25s ease forwards`,
                animationDelay: `${reviewedNotes.length * 0.06 + 0.3}s`,
                opacity: 0,
              }}
            >
              <Link to="/">{t("review.backToHome")}</Link>
            </Text>
          </>
        )}
      </VStack>
    )
  }

  return (
    <Flex align="flex-start" gap="0">
      <NotesReviewTableOfContentsSidebar
        notes={tocNotes}
        currentIndex={currentIndex}
      />

      <VStack
        ref={contentTopRef}
        align="stretch"
        flex="1"
        gap="2"
        minWidth="0"
        p="4"
      >
        <Flex align="center" justify="flex-end">
          <NotesReviewTableOfContentsMobileTrigger
            notes={tocNotes}
            currentIndex={currentIndex}
          />
        </Flex>

        <Text fontSize="xl" fontWeight="semibold" color="app.text">
          {currentNote!.title}
        </Text>

        <MarkdownTree content={currentNote!.content} />
        <NoteBadges badges={badges} note={currentNote!} />
        <LinkedNotesList notes={currentNote!.linkedNotes ?? []} />
        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          gap="2"
          justify="flex-end"
        >
          <OpenInObsidianButton note={currentNote!} />
          <Button
            bg="app.successBackground"
            color="app.successText"
            _hover={{ bg: "app.successHoverBackground" }}
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
