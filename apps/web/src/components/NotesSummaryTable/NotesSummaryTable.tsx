import { Badge, Flex, Heading, Link, Table, VStack } from "@chakra-ui/react"
import { Link as RouterLink, useParams } from "react-router-dom"

import { useNotesQuery } from "services"
import { useI18n } from "../../i18n"

import { AppError } from "../AppError"
import { NoteLink } from "../NoteLink"

import type {
  NotesSummaryTableProps,
  NotesSummaryTableRouteParamKey,
} from "./NotesSummaryTable.types"
import { getColumnLabel, resolveBadgeValues } from "./NotesSummaryTable.util"

export const NotesSummaryTable = ({ badges = [] }: NotesSummaryTableProps) => {
  const { view } = useParams<NotesSummaryTableRouteParamKey>()
  const { data, error } = useNotesQuery({ view })
  const { t } = useI18n()

  if (error) return <AppError message={error.message} />

  return (
    <VStack align="stretch" gap="4" p="6">
      <Flex align="center" justify="space-between">
        <Heading size="md">
          {t("notes.matchedCount", { count: data.notes.length })}
        </Heading>
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
          <Table.Row bg="app.panelBackgroundHover">
            <Table.ColumnHeader color="app.textMuted" borderColor="app.border">
              {t("notes.nameColumn")}
            </Table.ColumnHeader>
            {badges.map((badge) => (
              <Table.ColumnHeader
                key={badge}
                color="app.textMuted"
                borderColor="app.border"
              >
                {getColumnLabel(badge)}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.notes.map((note) => (
            <Table.Row
              key={note.id}
              bg="app.panelBackground"
              _hover={{ bg: "app.panelBackgroundHover" }}
            >
              <Table.Cell borderColor="app.border">
                <NoteLink note={note} color="app.accent" fontWeight="semibold" fontSize="md">
                  {note.title}
                </NoteLink>
              </Table.Cell>
              {badges.map((badge) => {
                const values = resolveBadgeValues(note, badge)

                return (
                  <Table.Cell
                    key={`${note.id}-${badge}`}
                    borderColor="app.border"
                  >
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
