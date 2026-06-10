import { Heading, Separator, SimpleGrid, VStack } from "@chakra-ui/react"

import { getViewGridColumns } from "./Home.util"
import type { HomeViewGroupSectionProps } from "./HomeViewGroupSection.types"
import { HomeViewCard } from "./HomeViewCard"

export function HomeViewGroupSection({
  group,
  views,
}: HomeViewGroupSectionProps) {
  return (
    <VStack align="stretch" gap={2} width="full">
      <Heading as="h2" size="sm" color="app.textMuted" fontWeight="medium">
        {group}
      </Heading>
      <Separator borderColor="app.border" />
      <SimpleGrid
        color="app.textMuted"
        columns={{
          base: Math.min(2, getViewGridColumns(views.length)),
          md: getViewGridColumns(views.length),
        }}
        gap={2}
        textAlign="center"
      >
        {views.map((view) => (
          <HomeViewCard key={view.id} view={view} />
        ))}
      </SimpleGrid>
    </VStack>
  )
}
