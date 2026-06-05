import { Badge, Flex, Heading, Link, Table, VStack } from "@chakra-ui/react"
import { Link as RouterLink, useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useI18n } from "../../i18n"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"

import type {
  NoteSummaryListProps,
  NoteSummaryListRouteParamKey,
} from "./NoteSummaryList.types"
import { getColumnLabel, resolveBadgeValues } from "./NoteSummaryList.util"

export const NoteSummaryList = ({ badges = [] }: NoteSummaryListProps) => {
  const { view } = useParams<NoteSummaryListRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()

  if (isLoading) return <LoadingScreen />
  if (error) return <AppError message={error.message} />

  return (
    <VStack align="stretch" gap="4" p="6">
      <Flex align="center" justify="space-between">
        <Heading size="md">{t("notes.matchedCount", { count: data.notes.length })}</Heading>
        <Link asChild color="app.accent">
          <RouterLink to="/">{t("review.backToHome")}</RouterLink>
        </Link>
      </Flex>
      <Table.Root
        bg="app.panelBackground"
        color="app.text"
        borderWidth="1px"
        borderColor="app.border"
        borderRadius="md"
        overflow="hidden"
      >
        <Table.Header bg="app.panelBackgroundHover">
          <Table.Row>
            <Table.ColumnHeader color="app.textMuted" borderColor="app.border">
              {t("notes.nameColumn")}
            </Table.ColumnHeader>
            {badges.map((badge) => (
              <Table.ColumnHeader key={badge} color="app.textMuted" borderColor="app.border">
                {getColumnLabel(badge)}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.notes.map((note) => (
            <Table.Row key={note.id} _hover={{ bg: "app.panelBackgroundHover" }}>
              <Table.Cell borderColor="app.border">
                <Link href={note.obsidianUrl} color="app.accent">
                  {note.title}
                </Link>
              </Table.Cell>
              {badges.map((badge) => {
                const values = resolveBadgeValues(note, badge)

                return (
                  <Table.Cell key={`${note.id}-${badge}`} borderColor="app.border">
                    <Flex gap="2" wrap="wrap">
                      {values.map((value) => (
                        <Badge
                          key={`${note.id}-${badge}-${value}`}
                          variant="subtle"
                          bg="app.panelBackgroundHover"
                          color="app.textMuted"
                        >
                          {value}
                        </Badge>
                      ))}
                    </Flex>
                  </Table.Cell>
                )
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </VStack>
  )
}
