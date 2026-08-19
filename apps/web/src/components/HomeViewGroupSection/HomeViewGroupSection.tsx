import { Heading, Separator, SimpleGrid, Skeleton, VStack } from "@chakra-ui/react"
import { Suspense } from "react"

import { getViewGridColumns } from "../Home/Home.util"
import type { HomeViewGroupSectionProps } from "./HomeViewGroupSection.types"
import { partitionPreviewViews } from "./HomeViewGroupSection.util"
import { HomeViewCard } from "../HomeViewCard"
import { HomeViewPreviewCard } from "../HomeViewPreviewCard"

const PREVIEW_SKELETON_HEIGHT = "180px"

export function HomeViewGroupSection({
  group,
  views,
}: Readonly<HomeViewGroupSectionProps>) {
  const { previewViews, standardViews } = partitionPreviewViews(views)

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
      {standardViews.length > 0 && (
        <SimpleGrid
          color="app.textMuted"
          columns={{
            base: 1,
            md: getViewGridColumns(standardViews.length),
          }}
          gap={2}
          textAlign="center"
        >
          {standardViews.map((view) => (
            <HomeViewCard key={view.id} view={view} />
          ))}
        </SimpleGrid>
      )}
      {previewViews.map((view) => (
        <Suspense
          key={view.id}
          fallback={<Skeleton borderRadius="md" height={PREVIEW_SKELETON_HEIGHT} />}
        >
          <HomeViewPreviewCard view={view} />
        </Suspense>
      ))}
    </VStack>
  )
}
