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
import { useI18n } from "../../i18n"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"
export function Home() {
  const { t } = useI18n()
  const { data, isLoading } = useStatsQuery()

  return (
    <VStack align="center" gap={6} pt={16}>
      <Box color="gray.300">
        <NotebookIcon animating={isLoading} size={80} />
      </Box>
      {data && (
        <SimpleGrid
          color="fg.muted"
          columns={{ base: 2, md: 4 }}
          gap={1}
          textAlign="center"
        >
          <StatRoot
            borderColor="gray.200"
            borderRadius="md"
            borderWidth="1px"
            px={3}
            py={2}
            size="sm"
          >
            <StatLabel>{t("home.notes")}</StatLabel>
            <StatValueText>{data.totalNotes}</StatValueText>
          </StatRoot>
          <StatRoot
            borderColor="gray.200"
            borderRadius="md"
            borderWidth="1px"
            px={3}
            py={2}
            size="sm"
          >
            <StatLabel>{t("home.modifiedToday")}</StatLabel>
            <StatValueText>{data.modifiedToday}</StatValueText>
          </StatRoot>
          {data.views.map((view) => (
            <Link
              key={view.name}
              style={{ textDecoration: "none" }}
              to={`/notes/${view.name}`}
            >
              <StatRoot
                borderColor="gray.200"
                borderRadius="md"
                borderWidth="1px"
                px={3}
                py={2}
                size="sm"
                _hover={{ borderColor: "gray.400" }}
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
