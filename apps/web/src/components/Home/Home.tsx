import { Box, Heading, Separator, SimpleGrid, VStack } from "@chakra-ui/react"

import { useHabitsQuery, useViewsQuery } from "services"

import { useI18n } from "../../i18n"

import { HabitCard } from "../HabitCard/HabitCard"
import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import { HomeViewGroupSection } from "./HomeViewGroupSection"
import { getViewGridColumns, groupViewsByGroup } from "./Home.util"

export function Home() {
  const { t } = useI18n()
  const { data, isLoading } = useViewsQuery({})
  const { data: habits } = useHabitsQuery()
  const groupedViews = data ? groupViewsByGroup(data.views) : undefined

  return (
    <VStack align="center" gap={6} pt={16} px={{ base: 4, md: "100px" }}>
      <Box color="app.iconMuted">
        <NotebookIcon animating={isLoading} size={80} />
      </Box>
      {groupedViews && (
        <VStack align="stretch" gap={4} width="full">
          {groupedViews.ungroupedViews.length > 0 && (
            <HomeViewGroupSection
              key="ungrouped"
              group={null}
              views={groupedViews.ungroupedViews}
            />
          )}
          {groupedViews.groups.map((groupedSection) => (
            <HomeViewGroupSection
              key={groupedSection.group}
              group={groupedSection.group}
              views={groupedSection.views}
            />
          ))}
        </VStack>
      )}
      {habits.length > 0 && (
        <VStack align="stretch" gap={2} width="full">
          <Heading as="h2" size="sm" color="app.textMuted" fontWeight="medium">
            {t("home.habits")}
          </Heading>
          <Separator borderColor="app.border" />
          <SimpleGrid
            color="app.textMuted"
            columns={{
              base: 1,
              md: getViewGridColumns(habits.length),
            }}
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
