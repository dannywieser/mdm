import {
  Box,
  HStack,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@chakra-ui/react"
import { useQueries } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { fetchIsRead } from "../../hooks/useIsRead/useIsRead"
import type { ViewSummary } from "../../types/views"

export function HomeNotesReviewCard({ view }: { view: ViewSummary }) {
  const readStates = useQueries({
    queries: view.noteIds.map((noteId) => ({
      queryKey: ["note-read", noteId],
      queryFn: () => fetchIsRead(noteId),
      enabled: noteId.trim().length > 0,
    })),
  })

  const total = view.noteIds.length
  const readCount = readStates.filter((state) => state.data === true).length
  const isComplete = total > 0 && readCount === total

  return (
    <Box
      key={view.id}
      borderRadius="md"
      _focusWithin={{
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: "app.accent",
        outlineOffset: "2px",
      }}
    >
      <Link
        style={{ textDecoration: "none", outline: "none" }}
        to={`/notes/${view.id}`}
      >
        <StatRoot
          borderColor="app.border"
          borderRadius="md"
          borderWidth="1px"
          backgroundColor="app.panelBackground"
          px={3}
          py={2}
          size="sm"
          _hover={{ borderColor: "app.borderHover" }}
        >
          <StatLabel>{view.name}</StatLabel>
          <HStack gap={1}>
            <StatValueText>{`${readCount}/${total}`}</StatValueText>
            {isComplete && (
              <Box
                color="app.successBackground"
                aria-label="review complete"
                pl={2}
              >
                <CircleCheck size={18} />
              </Box>
            )}
          </HStack>
        </StatRoot>
      </Link>
    </Box>
  )
}
