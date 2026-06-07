import {
  Box,
  Flex,
  Link,
  Popover,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Info } from "lucide-react"
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useParams } from "react-router-dom"

import { useHabitQuery } from "../../hooks/useHabitQuery/useHabitQuery"
import { useI18n } from "../../i18n"

import { HabitScoreValue } from "../HabitScoreValue/HabitScoreValue"
import type { HabitDetailRouteParamKey } from "./HabitDetail.types"
import { calculateHeatDotCount, formatChartDate, formatRecentMultiplier } from "./HabitDetail.util"

const TOOLTIP_STYLE = {
  backgroundColor: "var(--chakra-colors-chakra-body-bg, #fff)",
  border: "1px solid var(--chakra-colors-chakra-border-color, #e2e8f0)",
  borderRadius: "6px",
  fontSize: "12px",
}

const AXIS_TICK_STYLE = { fill: "var(--chakra-colors-gray-500)", fontSize: 10 }

export function HabitDetail() {
  const { habitId } = useParams<HabitDetailRouteParamKey>()
  const { t } = useI18n()
  const { data } = useHabitQuery({ habitId: habitId ?? "" })
  const heatDotCount = calculateHeatDotCount(data.mode, data.habitScore, data.targetScore)

  return (
    <VStack align="center" gap={6} pt={16} px={4} pb={16}>
      <Box
        borderColor="app.border"
        borderRadius="lg"
        borderWidth="1px"
        backgroundColor="app.panelBackground"
        p={4}
        w="full"
        maxW="3xl"
      >
        <VStack align="stretch" gap={4}>
          <Text fontSize="lg" fontWeight="semibold" color="app.text">
            {t(data.mode === "do-more" ? "habit.modeDoMore" : "habit.modeDoLess")}: {data.habitName}
          </Text>

          <StatRoot size="lg" textAlign="center">
            <Flex align="center" justify="center" gap={1.5}>
              <StatLabel color="app.textMuted">{t("habit.score")}</StatLabel>
              <Popover.Root positioning={{ placement: "top" }}>
                <Popover.Trigger asChild>
                  <Box
                    as="button"
                    aria-label={t("habit.scoreInfoLabel")}
                    display="flex"
                    alignItems="center"
                    cursor="pointer"
                    color="app.textMuted"
                    _hover={{ color: "app.text" }}
                  >
                    <Info size={14} />
                  </Box>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content
                    bg="app.panelBackground"
                    borderColor="app.border"
                    borderWidth="1px"
                    borderRadius="md"
                    p={3}
                    maxW="xs"
                  >
                    <VStack align="start" gap={1}>
                      {data.targetScore !== undefined && (
                        <Text fontSize="xs" color="app.textMuted">
                          {t("habit.scoreInfoTarget", { target: data.targetScore })}
                        </Text>
                      )}
                      <Text fontSize="xs" color="app.textMuted">
                        {t(data.mode === "do-less" ? "habit.scoreInfoDoLess" : "habit.scoreInfoDoMore")}
                      </Text>
                    </VStack>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            </Flex>
            <Flex align="center" justify="center" gap={2}>
              <HabitScoreValue mode={data.mode} score={data.habitScore} targetScore={data.targetScore} />
              {heatDotCount > 0 && (
                <Flex aria-label={t("habit.heatLevel", { count: heatDotCount })} gap={1}>
                  {Array.from({ length: heatDotCount }, (_, index) => (
                    <Box key={index} w="8px" h="8px" borderRadius="full" bg="red.500" />
                  ))}
                </Flex>
              )}
            </Flex>
          </StatRoot>

          <SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.daysLogged")}</StatLabel>
              <StatValueText>{data.windowEntries}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.currentStreak")}</StatLabel>
              <StatValueText>{data.streak}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.windowStart")}</StatLabel>
              <StatValueText>{formatChartDate(data.windowStart)}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.highestScore")}</StatLabel>
              <StatValueText>{data.allTimeHighScore}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.bestStreak")}</StatLabel>
              <StatValueText>{data.allTimeHighStreak}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.mostDaysLogged")}</StatLabel>
              <StatValueText>{data.allTimeHighWindowEntries}</StatValueText>
            </StatRoot>
          </SimpleGrid>

          {data.history.length > 0 && (
            <Box>
              <Text
                fontSize="xs"
                color="app.textMuted"
                mb={2}
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {t("habit.scoreOverTime")}
              </Text>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart
                  data={data.history}
                  margin={{ bottom: 4, left: 0, right: 0, top: 4 }}
                >
                  <CartesianGrid
                    stroke="var(--chakra-colors-gray-500)"
                    strokeOpacity={0.15}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={AXIS_TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={32}
                  />
                  <YAxis
                    yAxisId="score"
                    tick={AXIS_TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <YAxis
                    yAxisId="streak"
                    orientation="right"
                    tick={AXIS_TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatChartDate} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line
                    yAxisId="score"
                    type="monotone"
                    dataKey="habitScore"
                    name={t("habit.score")}
                    stroke="var(--chakra-colors-app-accent)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="streak"
                    type="monotone"
                    dataKey="streak"
                    name={t("habit.streak")}
                    stroke="var(--chakra-colors-app-success-background)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          )}

          {data.scoreEntries.length > 0 && (
            <Box>
              <Text
                fontSize="xs"
                color="app.textMuted"
                mb={2}
                letterSpacing="wide"
              >
                {t("habit.scoreEntries")}
              </Text>
              <Table.Root
                bg="app.panelBackground"
                color="app.text"
                borderWidth="1px"
                borderColor="app.border"
                borderRadius="md"
                overflow="hidden"
              >
                <Table.Header bg="app.panelBackgroundHover">
                  <Table.Row bg="app.panelBackgroundHover">
                    <Table.ColumnHeader color="app.textMuted" borderColor="app.border">
                      {t("habit.entryDate")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="app.textMuted" borderColor="app.border">
                      {t("habit.entryValue")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="app.textMuted" borderColor="app.border">
                      {t("habit.entryMultiplier")}
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.scoreEntries.map((entry) => (
                    <Table.Row
                      key={entry.date}
                      bg="app.panelBackground"
                      _hover={{ bg: "app.panelBackgroundHover" }}
                    >
                      <Table.Cell borderColor="app.border">
                        <Link href={entry.obsidianUrl} color="app.accent">
                          {formatChartDate(entry.date)}
                        </Link>
                      </Table.Cell>
                      <Table.Cell borderColor="app.border">{entry.value}</Table.Cell>
                      <Table.Cell borderColor="app.border">
                        {formatRecentMultiplier(entry.recentMultiplier)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
