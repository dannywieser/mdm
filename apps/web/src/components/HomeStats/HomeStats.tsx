import { useState } from "react"

import {
  Box,
  Collapsible,
  HStack,
  Heading,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react"
import { ChevronDownIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"

import type { HomeStatsProps } from "./HomeStats.types"

import {
  formatChangePercent,
  formatDate,
  formatMonthLabel,
  getChangeColor,
  getMonthTicks,
} from "./HomeStats.util"

export function HomeStats({ staleTime }: HomeStatsProps) {
  const { data } = useStatsQuery({ staleTime })
  const { homeStats } = data
  const show = homeStats.show

  const [isOpen, setIsOpen] = useState(true)

  const hasTopStats =
    show.totalNotes || show.totalFolders || show.totalAttachments

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
      <Collapsible.Root
        open={isOpen}
        onOpenChange={({ open }) => setIsOpen(open)}
      >
        <Collapsible.Trigger
          width="full"
          background="transparent"
          border="none"
          p={0}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
        >
          <HStack justify="space-between" w="full">
            <Heading size="sm" color="app.textMuted" fontWeight="medium">
              Notes Overview
            </Heading>
            <Box
              color="app.textMuted"
              transition="transform 0.2s"
              transform={isOpen ? "rotate(0deg)" : "rotate(-90deg)"}
            >
              <ChevronDownIcon size={14} />
            </Box>
          </HStack>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <VStack align="stretch" gap={4} pt={4}>
            {hasTopStats && (
              <SimpleGrid columns={3} gap={3}>
                {show.totalNotes && (
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Total notes</StatLabel>
                    <StatValueText>
                      {data.totalNotes.toLocaleString()}
                    </StatValueText>
                  </StatRoot>
                )}
                {show.totalFolders && (
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Folders</StatLabel>
                    <StatValueText>
                      {data.totalFolders.toLocaleString()}
                    </StatValueText>
                  </StatRoot>
                )}
                {show.totalAttachments && (
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Attachments</StatLabel>
                    <StatValueText>
                      {data.totalAttachments.toLocaleString()}
                    </StatValueText>
                  </StatRoot>
                )}
              </SimpleGrid>
            )}

            {show.modifiedToday && (
              <Text fontSize="sm" color="app.textMuted">
                Modified today:{" "}
                <Text as="span" fontWeight="semibold" color="app.text">
                  {data.modifiedToday}
                </Text>
              </Text>
            )}

            {show.notesCreated && (
              <Box>
                <Text
                  fontSize="xs"
                  color="app.textMuted"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Created
                </Text>
                <SimpleGrid columns={3} gap={3}>
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Last 30 days</StatLabel>
                    <StatValueText>{data.notesCreated.last30Days}</StatValueText>
                  </StatRoot>
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Last 90 days</StatLabel>
                    <StatValueText>{data.notesCreated.last90Days}</StatValueText>
                  </StatRoot>
                  <StatRoot size="sm">
                    <StatLabel color="app.textMuted">Last year</StatLabel>
                    <StatValueText>
                      {data.notesCreated.last365Days}
                    </StatValueText>
                  </StatRoot>
                </SimpleGrid>
              </Box>
            )}

            {show.trends && (
              <Box>
                <Text
                  fontSize="xs"
                  color="app.textMuted"
                  mb={1}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Trend vs previous 30 days
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
                <Text
                  fontSize="xs"
                  color="app.textMuted"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Notes per day — past year
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
                      formatter={(value: number) => [value, "notes"]}
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

            {show.folderBreakdown && data.folderBreakdown.length > 0 && (
              <Box>
                <Text
                  fontSize="xs"
                  color="app.textMuted"
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  By folder
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
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}
