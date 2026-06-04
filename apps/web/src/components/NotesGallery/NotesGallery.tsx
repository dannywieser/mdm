import { Alert, Card, Image, SimpleGrid, Text } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import type { FrontmatterValue } from "markdown"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useI18n } from "../../i18n"

import { LoadingScreen } from "../LoadingScreen/LoadingScreen"

import type { NotesGalleryRouteParamKey } from "./NotesGallery.types"

function getCoverSrc(cover: FrontmatterValue): string {
  return Array.isArray(cover) ? cover[0] : cover
}

export const NotesGallery = () => {
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()

  if (isLoading) return <LoadingScreen />

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t("notes.errorTitle")}</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const notesWithCovers = (data?.notes ?? []).filter((note) => {
    const cover = note.frontmatter?.cover
    if (cover == null) return false
    if (Array.isArray(cover)) return cover.length > 0 && cover[0] !== ""
    return cover !== ""
  })

  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={4} p={6}>
      {notesWithCovers.map((note) => (
        <a href={note.obsidianUrl} key={note.id} style={{ textDecoration: "none" }}>
        <Card.Root
          bg="app.panelBackground"
          borderColor="app.border"
          overflow="hidden"
          _hover={{ borderColor: "app.borderHover" }}
        >
          <Image
            alt={note.title}
            aspectRatio="16 / 9"
            objectFit="cover"
            src={getCoverSrc(note.frontmatter!.cover)}
          />
          <Card.Body p={3}>
            <Text
              color="app.text"
              fontSize="sm"
              fontWeight="medium"
              lineClamp={2}
            >
              {note.title}
            </Text>
          </Card.Body>
        </Card.Root>
        </a>
      ))}
    </SimpleGrid>
  )
}
