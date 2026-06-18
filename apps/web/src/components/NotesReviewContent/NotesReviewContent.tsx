import { Button, Flex, Text, VStack } from "@chakra-ui/react"
import { BookCheck } from "lucide-react"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { LinkedNotesList } from "../LinkedNotesList"
import { MarkdownTree } from "../MarkdownTree"
import { NoteBadges } from "../NoteBadges"
import { OpenInObsidianButton } from "../OpenInObsidianButton"
import { NotesReviewTableOfContentsMobileTrigger } from "../NotesReviewTableOfContentsMobileTrigger"
import { NotesReviewTableOfContentsSidebar } from "../NotesReviewTableOfContentsSidebar"
import type { NotesReviewContentProps } from "./NotesReviewContent.types"

export const NotesReviewContent = ({
  badges,
  currentIndex,
  currentNote,
  isPending,
  onMarkAsRead,
  tocNotes,
}: NotesReviewContentProps) => {
  const { t } = useI18n()

  return (
    <Flex align="flex-start" gap="0">
      <NotesReviewTableOfContentsSidebar
        notes={tocNotes}
        currentIndex={currentIndex}
      />

      <VStack align="stretch" flex="1" gap="2" minWidth="0" p="4">
        <Flex align="center" justify="flex-end">
          <NotesReviewTableOfContentsMobileTrigger
            notes={tocNotes}
            currentIndex={currentIndex}
          />
        </Flex>

        <Text fontSize="xl" fontWeight="semibold" color="app.text">
          {currentNote.title}
        </Text>

        <MarkdownTree content={currentNote.content} />
        <NoteBadges badges={badges} note={currentNote} />
        <LinkedNotesList notes={currentNote.linkedNotes ?? []} />

        <Flex
          flexDirection={{ base: "column", sm: "row" }}
          gap="2"
          justify="flex-end"
        >
          <OpenInObsidianButton note={currentNote} />
          <Button
            bg="app.successBackground"
            color="app.successText"
            _hover={{ bg: "app.successHoverBackground" }}
            width={{ base: "full", sm: "auto" }}
            onClick={onMarkAsRead}
            loading={isPending}
            {...focusRing}
          >
            <BookCheck size={16} />
            {t("notes.markAsRead")}
          </Button>
        </Flex>
      </VStack>
    </Flex>
  )
}
