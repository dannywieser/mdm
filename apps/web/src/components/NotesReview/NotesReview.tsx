import { useEffect, useMemo, useRef, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import type { Note } from "markdown"

import { fetchIsRead, useNotesQuery, useToggleRead } from "services"

import type { NotesReviewProps, NotesReviewRouteParamKey } from "./NotesReview.types"
import { areReadStatesSettled, buildTocNotes } from "./NotesReview.util"
import { NotesReviewComplete } from "../NotesReviewComplete"
import { NotesReviewContent } from "../NotesReviewContent"

export const NotesReview = ({ badges = [] }: NotesReviewProps) => {
  const { view } = useParams<NotesReviewRouteParamKey>()
  const { data } = useNotesQuery({ view })
  // -1 means "not yet initialized" — keeps LoadingScreen visible until the
  // first-unread position is known, preventing a flash of note 0.
  const [currentIndex, setCurrentIndex] = useState(-1)
  const initialized = useRef(false)

  const notes = useMemo(() => data.notes, [data.notes])
  const currentNote = notes[currentIndex] as Note | undefined
  const toggleRead = useToggleRead({ noteId: currentNote?.id ?? "" })

  useEffect(() => {
    if (currentIndex < 0) return
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [currentIndex])

  const readStates = useQueries({
    queries: notes.map((note) => ({
      queryKey: ["read", note.id],
      queryFn: () => fetchIsRead(note.id),
      enabled: note.id.trim().length > 0,
    })),
  })

  useEffect(() => {
    if (initialized.current || !areReadStatesSettled(readStates)) return
    initialized.current = true
    const firstUnread = notes.findIndex((_, i) => readStates[i]?.data !== true)
    setCurrentIndex(firstUnread === -1 ? notes.length : firstUnread)
  }, [notes, readStates])

  const tocNotes = buildTocNotes(notes, readStates)

  const advanceToNextUnread = () => {
    const nextUnread = notes.findIndex(
      (_, i) => i > currentIndex && readStates[i]?.data !== true,
    )
    setCurrentIndex(nextUnread === -1 ? notes.length : nextUnread)
  }

  const handleMarkAsRead = () => {
    if (readStates[currentIndex]?.data === true) {
      advanceToNextUnread()
      return
    }
    toggleRead.mutate(undefined, { onSuccess: advanceToNextUnread })
  }

  const isLoading = notes.length > 0 && currentIndex === -1
  const reviewedNotes = notes.filter((_, i) => readStates[i]?.data === true)

  if (isLoading || !notes.length || currentIndex >= notes.length) {
    return <NotesReviewComplete isLoading={isLoading} reviewedNotes={reviewedNotes} />
  }

  if (!currentNote) return null

  return (
    <NotesReviewContent
      badges={badges}
      currentIndex={currentIndex}
      currentNote={currentNote}
      isPending={toggleRead.isPending}
      onMarkAsRead={handleMarkAsRead}
      tocNotes={tocNotes}
    />
  )
}
