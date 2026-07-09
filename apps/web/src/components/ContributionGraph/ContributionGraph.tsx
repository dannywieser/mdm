import { Box, HStack, Text, VStack } from "@chakra-ui/react"

import { useI18n } from "../../i18n"

import { focusRing } from "../../theme/focusRing"

import type { ContributionDay, ContributionGraphProps } from "./ContributionGraph.types"
import {
  buildContributionDays,
  buildContributionYears,
  formatContributionDate,
} from "./ContributionGraph.util"

const CELL_SIZE_PX = 9
const CELL_GAP_PX = 1

const LEVEL_STYLES = [
  { bg: "app.border", opacity: 0.6 },
  { bg: "app.successBackground", opacity: 0.35 },
  { bg: "app.successBackground", opacity: 0.55 },
  { bg: "app.successBackground", opacity: 0.8 },
  { bg: "app.successBackground", opacity: 1 },
] as const

const OUTLIER_LEVEL_STYLES = [
  { bg: "orange.400", opacity: 0.4 },
  { bg: "orange.400", opacity: 0.6 },
  { bg: "orange.400", opacity: 0.8 },
  { bg: "orange.400", opacity: 1 },
] as const

export function ContributionGraph({ history }: Readonly<ContributionGraphProps>) {
  const { t } = useI18n()
  const days = buildContributionDays(history)

  if (days.length === 0) {
    return null
  }

  const years = buildContributionYears(days)
  const hasOutliers = days.some((day) => day.isOutlier)

  const buildDetailLines = (day: ContributionDay) => [
    { id: "created", text: t("stats.activityCreated", { created: day.entriesCreated }) },
    { id: "modified", text: t("stats.activityModified", { modified: day.entriesModified }) },
    { id: "folders", text: t("stats.activityFoldersTouched", { folders: day.foldersTouched }) },
  ]

  const buildAriaDetails = (day: ContributionDay, detailLines: ReturnType<typeof buildDetailLines>) => {
    const details = detailLines.map((line) => line.text).join(" · ")
    return day.isOutlier ? `${details} — ${t("stats.activityOutlier")}` : details
  }

  return (
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
        <Text fontSize="xs" color="app.textMuted">
          {t("stats.activityGraph")}
        </Text>

        {years.map(({ days: yearDays, year }) => (
          <VStack key={year} align="stretch" gap={2}>
            <Text fontSize="xs" color="app.textMuted" fontWeight="medium">
              {year}
            </Text>
            <Box
              display="grid"
              gap={`${CELL_GAP_PX}px`}
              gridTemplateColumns={`repeat(auto-fill, minmax(${CELL_SIZE_PX}px, 1fr))`}
            >
              {yearDays.map((day) => {
                const style = day.isOutlier
                  ? OUTLIER_LEVEL_STYLES[day.outlierLevel - 1]
                  : LEVEL_STYLES[day.level]
                const detailLines = buildDetailLines(day)
                return (
                  <Box key={day.date} className="group" position="relative" lineHeight={0}>
                    <Box
                      aria-label={`${formatContributionDate(day.date)} — ${buildAriaDetails(day, detailLines)}`}
                      as="button"
                      aspectRatio={1}
                      bg={style.bg}
                      border="none"
                      borderRadius="2px"
                      cursor="default"
                      opacity={style.opacity}
                      padding={0}
                      w="full"
                      {...focusRing}
                    />
                    <Box
                      position="absolute"
                      bottom="100%"
                      left="50%"
                      mb={2}
                      opacity={0}
                      pointerEvents="none"
                      transform="translateX(-50%)"
                      transition="opacity 0.15s"
                      zIndex={10}
                      _groupFocusWithin={{ opacity: 1 }}
                      _groupHover={{ opacity: 1 }}
                    >
                      <Box
                        bg="app.panelBackground"
                        borderColor="app.border"
                        borderRadius="md"
                        borderWidth="1px"
                        boxShadow="md"
                        px={3}
                        py={2}
                        minW="max-content"
                        whiteSpace="nowrap"
                      >
                        <VStack align="stretch" gap={0.5}>
                          <Text fontSize="xs" fontWeight="medium">
                            {formatContributionDate(day.date)}
                          </Text>
                          {detailLines.map((line) => (
                            <Text key={line.id} fontSize="xs" color="app.textMuted">
                              {line.text}
                            </Text>
                          ))}
                          {day.isOutlier && (
                            <Text fontSize="xs" color="orange.400">
                              {t("stats.activityOutlier")}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </VStack>
        ))}

        <HStack gap={1} justify="flex-end">
          <Text fontSize="xs" color="app.textMuted">
            {t("stats.activityLess")}
          </Text>
          {LEVEL_STYLES.map((style, level) => (
            <Box
              key={level}
              bg={style.bg}
              opacity={style.opacity}
              borderRadius="2px"
              h={`${CELL_SIZE_PX}px`}
              w={`${CELL_SIZE_PX}px`}
            />
          ))}
          <Text fontSize="xs" color="app.textMuted">
            {t("stats.activityMore")}
          </Text>
        </HStack>

        {hasOutliers && (
          <HStack gap={1} justify="flex-end">
            <Text fontSize="xs" color="app.textMuted">
              {t("stats.activityOutlier")}
            </Text>
            {OUTLIER_LEVEL_STYLES.map((style, index) => (
              <Box
                key={index}
                bg={style.bg}
                opacity={style.opacity}
                borderRadius="2px"
                h={`${CELL_SIZE_PX}px`}
                w={`${CELL_SIZE_PX}px`}
              />
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  )
}
