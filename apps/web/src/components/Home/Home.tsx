import {
  Box,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  VStack,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"

import { HomeStats } from "../HomeStats/HomeStats"
import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
import { getViewGridColumns } from "./Home.util"

export function Home() {
  const { data, isLoading } = useStatsQuery({})

  return (
    <VStack align="center" gap={6} pt={16} px={4} pb={16}>
      <Box color="app.iconMuted">
        <NotebookIcon animating={isLoading} size={80} />
      </Box>
      {data && (
        <>
          <SimpleGrid
            color="app.textMuted"
            columns={{ base: Math.min(2, getViewGridColumns(data.views.length)), md: getViewGridColumns(data.views.length) }}
            gap={2}
            textAlign="center"
          >
            {data.views.map((view) => (
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
          <HomeStats />
        </>
      )}
    </VStack>
  )
}
