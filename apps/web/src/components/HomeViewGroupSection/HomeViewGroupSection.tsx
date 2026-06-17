import { Heading, Separator, SimpleGrid, VStack } from "@chakra-ui/react"

import { getViewGridColumns } from "../Home/Home.util"
import type { HomeViewGroupSectionProps } from "./HomeViewGroupSection.types"
import { HomeViewCard } from "../HomeViewCard"

export function HomeViewGroupSection({
  group,
  views,
}: Readonly<HomeViewGroupSectionProps>) {
  return (
    <VStack align="stretch" gap={2} width="full">
      {group && (
        <>
          <Heading as="h2" size="sm" color="app.textMuted" fontWeight="medium">
            {group}
          </Heading>
          <Separator borderColor="app.border" />
        </>
      )}
      <SimpleGrid
        color="app.textMuted"
        columns={{
          base: 1,
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
