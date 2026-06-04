import { Badge, Flex, Heading, Table, VStack } from "@chakra-ui/react"
import { getValueByPath } from "mdm-util"
import type { Note } from "markdown"
import { Link, useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useI18n } from "../../i18n"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"

import type {
  NoteSummaryListProps,
  NoteSummaryListRouteParamKey,
} from "./NoteSummaryList.types"

const resolveBadgeValues = (note: Note, badge: string): string[] => {
  const value = getValueByPath(note, badge)

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value]
  }

  return []
}

const getColumnLabel = (badge: string): string => badge.split(".").filter(Boolean).at(-1) ?? badge

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
        <Link to="/">{t("review.backToHome")}</Link>
      </Flex>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t("notes.nameColumn")}</Table.ColumnHeader>
            {badges.map((badge) => (
              <Table.ColumnHeader key={badge}>{getColumnLabel(badge)}</Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.notes.map((note) => (
            <Table.Row key={note.id}>
              <Table.Cell>
                <a href={note.obsidianUrl}>{note.title}</a>
              </Table.Cell>
              {badges.map((badge) => {
                const values = resolveBadgeValues(note, badge)

                return (
                  <Table.Cell key={`${note.id}-${badge}`}>
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
