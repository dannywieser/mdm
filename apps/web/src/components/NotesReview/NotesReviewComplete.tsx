import { Box, Text, VStack } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"
import { NotebookIcon } from "../NotebookIcon"
import type { NotesReviewCompleteProps } from "./NotesReviewComplete.types"

const reviewItemIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

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
