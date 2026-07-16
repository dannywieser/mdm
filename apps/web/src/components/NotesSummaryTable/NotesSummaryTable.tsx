import { Badge, Flex, Heading, Link, Table, VStack, chakra } from "@chakra-ui/react"
import { useMemo } from "react"
import { Link as RouterLink, useParams } from "react-router-dom"

import { useNotesQuery } from "services"
import { useI18n } from "../../i18n"
import { useColumnSort } from "../../hooks/useColumnSort/useColumnSort"
import { focusRing } from "../../theme/focusRing"

import { AppError } from "../AppError"
import { NoteLink } from "../NoteLink"

import type {
  NotesSummaryTableProps,
  NotesSummaryTableRouteParamKey,
} from "./NotesSummaryTable.types"
import {
  getAriaSort,
  getColumnLabel,
  nameColumnSortKey,
  resolveBadgeValues,
  sortNotes,
} from "./NotesSummaryTable.util"

const sortStorageKeyForView = (view: string | undefined): string =>
  `mdm.notesSummaryTable.sort.${view ?? "all"}`

export const NotesSummaryTable = ({ badges = [] }: NotesSummaryTableProps) => {
  const { view } = useParams<NotesSummaryTableRouteParamKey>()
  const { data, error } = useNotesQuery({ view })
  const { t } = useI18n()
  const { sortKey, direction, toggleSort } = useColumnSort({
    storageKey: sortStorageKeyForView(view),
    defaultSortKey: nameColumnSortKey,
  })

  const sortedNotes = useMemo(
    () => sortNotes(data.notes, sortKey, direction),
    [data, sortKey, direction],
  )

  if (error) return <AppError message={error.message} />

  const renderColumnHeader = (columnKey: string, label: string) => {
    const isSorted = sortKey === columnKey

    return (
      <Table.ColumnHeader
        key={columnKey}
        color="app.textMuted"
        borderColor="app.border"
        p="0"
        aria-sort={getAriaSort(isSorted, direction)}
      >
        <chakra.button
          type="button"
          display="flex"
          alignItems="center"
          gap="1"
          width="100%"
          px="4"
          py="3"
          color="inherit"
          fontWeight="inherit"
          fontSize="inherit"
          textAlign="left"
          cursor="pointer"
          _hover={{ color: "app.text" }}
          {...focusRing}
          _focusVisible={{ ...focusRing._focusVisible, outlineOffset: "-2px" }}
          onClick={() => {
            toggleSort(columnKey)
          }}
          aria-label={t("notes.sortColumn", { column: label })}
        >
          {label}
          {isSorted && <span aria-hidden="true">{direction === "asc" ? "▲" : "▼"}</span>}
        </chakra.button>
      </Table.ColumnHeader>
    )
  }

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
            {renderColumnHeader(nameColumnSortKey, t("notes.nameColumn"))}
            {badges.map((badge) => renderColumnHeader(badge, getColumnLabel(badge)))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedNotes.map((note) => (
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
