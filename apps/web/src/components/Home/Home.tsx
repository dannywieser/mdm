import {
  Box,
  SimpleGrid,
  VStack,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import { useStatsQuery } from "../../hooks/useStatsQuery"
import { Header } from "../Header/Header"
import { NotebookIcon } from "../NotebookIcon/NotebookIcon"

export function Home() {
  const { t } = useI18n()
  const { data, isLoading } = useStatsQuery()

  return (
    <Box h="100vh" position="relative">
      <Header />
      <VStack align="center" gap={6} pt={16}>
        <Box color="gray.300">
          <NotebookIcon animating={isLoading} size={80} />
        </Box>
        {data && (
          <SimpleGrid color="fg.muted" columns={{ base: 2, md: 4 }} gap={1} textAlign="center">
            <StatRoot borderColor="gray.200" borderRadius="md" borderWidth="1px" px={3} py={2} size="sm">
              <StatLabel>{t('home.notes')}</StatLabel>
              <StatValueText>{data.totalNotes}</StatValueText>
            </StatRoot>
            <StatRoot borderColor="gray.200" borderRadius="md" borderWidth="1px" px={3} py={2} size="sm">
              <StatLabel>{t('home.modifiedToday')}</StatLabel>
              <StatValueText>{data.modifiedToday}</StatValueText>
            </StatRoot>
            {data.views.map((view) => (
              <StatRoot borderColor="gray.200" borderRadius="md" borderWidth="1px" key={view.name} px={3} py={2} size="sm">
                <StatLabel>{view.name}</StatLabel>
                <StatValueText>{view.count}</StatValueText>
              </StatRoot>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  )
}
