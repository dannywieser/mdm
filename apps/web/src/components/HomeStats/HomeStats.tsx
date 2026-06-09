import {
  Box,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"
import { useI18n } from "../../i18n"

import type { HomeStatsProps } from "./HomeStats.types"

import {
  formatChangePercent,
  formatDate,
  formatMonthLabel,
  getChangeColor,
  getMonthTicks,
} from "./HomeStats.util"

export function HomeStats({ staleTime }: HomeStatsProps) {
  const { t } = useI18n()
  const { data } = useStatsQuery({ staleTime })
  const { homeStats } = data
  const show = homeStats.show

  const hasTopStats =
    show.totalNotes || show.totalFolders || show.totalAttachments

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
          {hasTopStats && (
            <SimpleGrid columns={3} gap={3}>
              {show.totalNotes && (
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.totalNotes")}
                  </StatLabel>
                  <StatValueText>
                    {data.totalNotes.toLocaleString()}
                  </StatValueText>
                </StatRoot>
              )}
              {show.totalFolders && (
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.folders")}
                  </StatLabel>
                  <StatValueText>
                    {data.totalFolders.toLocaleString()}
                  </StatValueText>
                </StatRoot>
              )}
              {show.totalAttachments && (
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.attachments")}
                  </StatLabel>
                  <StatValueText>
                    {data.totalAttachments.toLocaleString()}
                  </StatValueText>
                </StatRoot>
              )}
            </SimpleGrid>
          )}

          {show.modifiedToday && (
            <Text fontSize="sm" color="app.textMuted">
              {t("stats.modifiedToday")}{" "}
              <Text as="span" fontWeight="semibold" color="app.text">
                {data.modifiedToday}
              </Text>
            </Text>
          )}

          {show.notesCreated && (
            <Box>
              <Text fontSize="xs" color="app.textMuted" mb={2}>
                {t("stats.created")}
              </Text>
              <SimpleGrid columns={3} gap={3}>
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.last30Days")}
                  </StatLabel>
                  <StatValueText>{data.notesCreated.last30Days}</StatValueText>
                </StatRoot>
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.last90Days")}
                  </StatLabel>
                  <StatValueText>{data.notesCreated.last90Days}</StatValueText>
                </StatRoot>
                <StatRoot size="sm">
                  <StatLabel color="app.textMuted">
                    {t("stats.lastYear")}
                  </StatLabel>
                  <StatValueText>
                    {data.notesCreated.last365Days}
                  </StatValueText>
                </StatRoot>
              </SimpleGrid>
            </Box>
          )}

          {show.trends && (
            <Box>
              <Text fontSize="xs" color="app.textMuted" mb={1}>
                {t("stats.trend")}
              </Text>
              <Text fontSize="sm">
                <Text
                  as="span"
                  fontWeight="semibold"
                  color={getChangeColor(data.trends.changePercent)}
                >
                  {formatChangePercent(data.trends.changePercent)}
                </Text>
                <Text as="span" color="app.textMuted">
                  {" "}
                  ({data.trends.notesLast30Days} vs{" "}
                  {data.trends.notesPrevious30Days} notes)
                </Text>
              </Text>
            </Box>
          )}

          {show.notesPerDay && data.notesPerDay.length > 0 && (
            <Box>
              <Text fontSize="xs" color="app.textMuted" mb={2}>
                {t("stats.notesPerDay")}
              </Text>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart
                  data={data.notesPerDay}
                  margin={{ bottom: 20, left: 0, right: 0, top: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="notesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chakra-colors-blue-400)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chakra-colors-blue-400)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    ticks={getMonthTicks(data.notesPerDay)}
                    tickFormatter={formatMonthLabel}
                    tick={{ fill: "var(--chakra-colors-gray-500)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "var(--chakra-colors-chakra-body-bg, #fff)",
                      border:
                        "1px solid var(--chakra-colors-chakra-border-color, #e2e8f0)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [value, t("stats.notes")]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chakra-colors-blue-400)"
                    strokeWidth={1.5}
                    fill="url(#notesGradient)"
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}

          {show.notesWithoutCreatedDate && data.notesWithoutCreatedDate > 0 && (
            <Text fontSize="sm" color="app.textMuted">
              {t("stats.missingCreatedDate")}{" "}
              <Text as="span" fontWeight="semibold" color="app.text">
                {data.notesWithoutCreatedDate.toLocaleString()}
              </Text>
            </Text>
          )}

          {show.folderBreakdown && data.folderBreakdown.length > 0 && (
            <Box>
              <Text fontSize="xs" color="app.textMuted" mb={2}>
                {t("stats.byFolder")}
              </Text>
              <VStack align="stretch" gap={1}>
                {data.folderBreakdown.slice(0, 8).map(({ folder, count }) => (
                  <Box
                    key={folder}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Text
                      fontSize="sm"
                      color="app.textMuted"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {folder}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="app.text"
                      ml={4}
                      flexShrink={0}
                    >
                      {count}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
