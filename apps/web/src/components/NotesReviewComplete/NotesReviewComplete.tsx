import { Box, Text, VStack } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"
import { NotebookIcon } from "../NotebookIcon"
import { NoteLink } from "../NoteLink"
import type { NotesReviewCompleteProps } from "./NotesReviewComplete.types"

const reviewItemIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

const fadeInUp = (delay: number) => ({
  animation: `${reviewItemIn} 0.25s ease forwards`,
  animationDelay: `${delay}s`,
  opacity: 0,
})

export const NotesReviewComplete = ({ isLoading, reviewedNotes }: NotesReviewCompleteProps) => {
  const { t } = useI18n()

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
                  color="app.textMuted"
                  fontSize="sm"
                  css={fadeInUp(i * 0.06)}
                >
                  <NoteLink note={note} textDecoration="none" color="inherit">
                    {note.title}
                  </NoteLink>
                </Text>
              ))}
            </VStack>
          )}
          <Text
            fontSize="lg"
            fontWeight="semibold"
            css={fadeInUp(reviewedNotes.length * 0.06 + 0.1)}
          >
            {t("review.complete")}
          </Text>
          <Text
            fontSize="sm"
            css={fadeInUp(reviewedNotes.length * 0.06 + 0.3)}
          >
            <Link to="/">{t("review.backToHome")}</Link>
          </Text>
        </>
      )}
    </VStack>
  )
}
