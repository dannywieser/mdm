import {
  Box,
  Separator,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { useHabitsQuery } from "../../hooks/useHabitsQuery/useHabitsQuery"
import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"
import { useI18n } from "../../i18n"

import { HabitCard } from "../HabitCard/HabitCard"
import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import { getViewGridColumns, groupViewsByGroup } from "./Home.util"

export function Home() {
  const { t } = useI18n()
  const { data, isLoading } = useStatsQuery({})
  const { data: habits } = useHabitsQuery()
  const groupedViews = data ? groupViewsByGroup(data.views) : undefined

  return (
    <VStack align="center" gap={6} pt={16}>
      <Box color="app.iconMuted">
        <NotebookIcon animating={isLoading} size={80} />
      </Box>
      {groupedViews && (
        <VStack align="stretch" gap={4}>
          {groupedViews.ungroupedViews.length > 0 && (
            <SimpleGrid
              color="app.textMuted"
              columns={{
                base: Math.min(2, getViewGridColumns(groupedViews.ungroupedViews.length)),
                md: getViewGridColumns(groupedViews.ungroupedViews.length),
              }}
              gap={2}
              textAlign="center"
            >
              {groupedViews.ungroupedViews.map((view) => (
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
                      <StatValueText>{view.count}</StatValueText>
                    </StatRoot>
                  </Link>
                </Box>
              ))}
            </SimpleGrid>
          )}
          {groupedViews.groups.map((groupedSection) => (
            <VStack key={groupedSection.group} align="stretch" gap={2}>
              <Text color="app.textMuted" fontWeight="medium">
                {groupedSection.group}
              </Text>
              <Separator borderColor="app.border" />
              <SimpleGrid
                color="app.textMuted"
                columns={{
                  base: Math.min(2, getViewGridColumns(groupedSection.views.length)),
                  md: getViewGridColumns(groupedSection.views.length),
                }}
                gap={2}
                textAlign="center"
              >
                {groupedSection.views.map((view) => (
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
                        <StatValueText>{view.count}</StatValueText>
                      </StatRoot>
                    </Link>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          ))}
        </VStack>
      )}
      {habits.length > 0 && (
        <VStack align="stretch" gap={2}>
          <Text color="app.textMuted" fontWeight="medium">
            {t("home.habits")}
          </Text>
          <Separator borderColor="app.border" />
          <SimpleGrid
            color="app.textMuted"
            columns={{ base: Math.min(2, getViewGridColumns(habits.length)), md: getViewGridColumns(habits.length) }}
            gap={2}
            textAlign="center"
          >
            {habits.map((habit) => (
              <HabitCard key={habit.habitId} habit={habit} />
            ))}
          </SimpleGrid>
        </VStack>
      )}
    </VStack>
  )
}
