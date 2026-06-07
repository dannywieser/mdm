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
import { formatChartDate } from "./HabitDetail.util"

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
          <Text fontSize="lg" fontWeight="semibold" color="app.text">
            {data.habitName}
          </Text>

          <SimpleGrid columns={3} gap={3}>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.score")}</StatLabel>
              <HabitScoreValue mode={data.mode} score={data.habitScore} targetScore={data.targetScore} />
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.daysLogged")}</StatLabel>
              <StatValueText>{data.windowEntries}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.currentStreak")}</StatLabel>
              <StatValueText>{data.streak}</StatValueText>
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
                    stroke="var(--chakra-colors-blue-400)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="streak"
                    type="monotone"
                    dataKey="streak"
                    name={t("habit.currentStreak")}
                    stroke="var(--chakra-colors-orange-400)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
