import { Drawer, IconButton, Text, VStack } from "@chakra-ui/react"
import { BookCheck, X } from "lucide-react"

import { useI18n } from "../../i18n"

import type { ReadNotesPanelProps } from "./ReadNotesPanel.types"

const ReadNotesList = ({ notes }: ReadNotesPanelProps) => {
  const { t } = useI18n()

  return (
    <VStack align="stretch" gap="1">
      <Text
        color="fg.muted"
        fontSize="xs"
        fontWeight="semibold"
        letterSpacing="wide"
        mb="1"
        textTransform="uppercase"
      >
        {t("review.read")}
      </Text>
      {notes.map((note) => (
        <Text
          key={note.id}
          color="fg.subtle"
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

export const ReadNotesSidebar = ({ notes }: ReadNotesPanelProps) => {
  if (notes.length === 0) return null

  return (
    <VStack
      align="stretch"
      borderRight="1px solid"
      borderColor="border.muted"
      display={{ base: "none", sm: "flex" }}
      flexShrink={0}
      gap="1"
      minWidth="0"
      p="4"
      width="200px"
    >
      <ReadNotesList notes={notes} />
    </VStack>
  )
}

export const ReadNotesMobileTrigger = ({ notes }: ReadNotesPanelProps) => {
  const { t } = useI18n()

  if (notes.length === 0) return null

  return (
    <Drawer.Root placement="bottom" size="full">
      <Drawer.Trigger asChild>
        <IconButton
          aria-label={t("review.read")}
          colorPalette="green"
          display={{ base: "flex", sm: "none" }}
          size="sm"
          variant="ghost"
        >
          <BookCheck size={16} />
          <Text fontSize="xs" ml="1">
            {notes.length}
          </Text>
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("review.read")}</Drawer.Title>
            <Drawer.CloseTrigger asChild>
              <IconButton aria-label={t("review.close")} variant="ghost">
                <X size={16} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body>
            <VStack align="stretch" gap="3">
              {notes.map((note) => (
                <Text key={note.id} fontSize="sm">
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
