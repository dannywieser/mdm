import {
  Box,
  FormatNumber,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react"

import { useStatsHistory, useStatsMeta } from "services"
import { useI18n } from "../../i18n"

import { ContributionGraph } from "../ContributionGraph"

import type { HomeStatsProps } from "./HomeStats.types"

import { buildAttachmentBreakdown } from "./HomeStats.util"

export function HomeStats({ staleTime }: Readonly<HomeStatsProps>) {
  const { t } = useI18n()
  const { data } = useStatsMeta({ staleTime })
  const { data: history } = useStatsHistory({ staleTime })
  const attachmentBreakdown = buildAttachmentBreakdown(data.totalAttachments)

  return (
    <VStack align="center" gap={6} pt={16} px={4} pb={16}>
      <Box
        borderColor="app.border"
        borderRadius="lg"
        borderWidth="1px"
        backgroundColor="app.panelBackground"
        p={4}
        w="full"
        maxW="2xl"
      >
        <VStack align="stretch" gap={4}>
          <SimpleGrid columns={3} gap={3}>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">
                {t("stats.totalNotes")}
              </StatLabel>
              <StatValueText>
                <FormatNumber
                  value={data.totalNotes}
                  notation="compact"
                  compactDisplay="short"
                />
              </StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">
                {t("stats.folders")}
              </StatLabel>
              <StatValueText>
                <FormatNumber
                  value={data.totalFolders}
                  notation="compact"
                  compactDisplay="short"
                />
              </StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">
                {t("stats.totalWords")}
              </StatLabel>
              <StatValueText>
                <FormatNumber
                  value={data.totalWords}
                  notation="compact"
                  compactDisplay="short"
                />
              </StatValueText>
            </StatRoot>
          </SimpleGrid>

          {attachmentBreakdown.length > 0 && (
            <Box>
              <Text fontSize="xs" color="app.textMuted" mb={2}>
                {t("stats.attachments")}
              </Text>
              <SimpleGrid columns={3} gap={3}>
                {attachmentBreakdown.map(({ extension, count }) => (
                  <StatRoot key={extension} size="sm">
                    <StatLabel color="app.textMuted">{extension}</StatLabel>
                    <StatValueText>
                      <FormatNumber
                        value={count}
                        notation="compact"
                        compactDisplay="short"
                      />
                    </StatValueText>
                  </StatRoot>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Box>

      <ContributionGraph history={history} />
    </VStack>
  )
}
