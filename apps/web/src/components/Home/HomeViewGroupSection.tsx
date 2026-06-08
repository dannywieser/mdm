import { Box, Heading, Separator, SimpleGrid, StatLabel, StatRoot, StatValueText, VStack } from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { getViewGridColumns } from "./Home.util"
import type { HomeViewGroupSectionProps } from "./HomeViewGroupSection.types"

export function HomeViewGroupSection({ group, views }: HomeViewGroupSectionProps) {
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
  )
}
