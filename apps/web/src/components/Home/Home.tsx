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

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
export function Home() {
  const { data, isLoading } = useStatsQuery({})

  return (
    <VStack align="center" gap={6} pt={16}>
      <Box color="app.iconMuted">
        <NotebookIcon animating={isLoading} size={80} />
      </Box>
      {data && (
        <SimpleGrid
          color="app.textMuted"
          columns={{ base: 2, md: 4 }}
          gap={1}
          textAlign="center"
        >
          {data.views.map((view) => (
            <Link
              key={view.id}
              style={{ textDecoration: "none" }}
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
          ))}
        </SimpleGrid>
      )}
    </VStack>
  )
}
