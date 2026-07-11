import { Box, HStack, Text, VStack, chakra } from "@chakra-ui/react"

import { useI18n } from "../../i18n"

import { focusRing } from "../../theme/focusRing"

import type { HabitCalendarDay, HabitCalendarProps } from "./HabitCalendar.types"
import { buildHabitCalendarMonths, formatCalendarDate } from "./HabitCalendar.util"

const CELL_SIZE_PX = 14
const CELL_GAP_PX = 2
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

const LEVEL_STYLES = [
  { bg: "app.border", opacity: 0.6 },
  { bg: "app.successBackground", opacity: 0.35 },
  { bg: "app.successBackground", opacity: 0.55 },
  { bg: "app.successBackground", opacity: 0.8 },
  { bg: "app.successBackground", opacity: 1 },
] as const

const GRID_COLUMNS = `repeat(7, ${CELL_SIZE_PX}px)`

export function HabitCalendar({ history, referenceDate }: Readonly<HabitCalendarProps>) {
  const { t } = useI18n()

  if (history.length === 0) {
    return null
  }

  const months = buildHabitCalendarMonths(history, referenceDate)

  if (months.length === 0) {
    return null
  }

  return (
    <Box
      borderColor="app.border"
      borderRadius="lg"
      borderWidth="1px"
      backgroundColor="app.panelBackground"
      p={4}
      w="full"
    >
      <VStack align="stretch" gap={4}>
        <Text fontSize="xs" color="app.textMuted" letterSpacing="wide">
          {t("habit.calendarTitle")}
        </Text>

        <HStack align="flex-start" gap={4} wrap="wrap">
          {months.map((month) => (
            <VStack key={month.monthKey} align="stretch" gap={1.5}>
              <Text fontSize="xs" color="app.textMuted" fontWeight="medium">
                {month.label}
              </Text>
              <Box display="grid" gap={`${CELL_GAP_PX}px`} gridTemplateColumns={GRID_COLUMNS}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <Text
                    key={index}
                    fontSize="9px"
                    lineHeight={`${CELL_SIZE_PX}px`}
                    textAlign="center"
                    color="app.textMuted"
                  >
                    {label}
                  </Text>
                ))}
              </Box>
              <Box display="grid" gap={`${CELL_GAP_PX}px`} gridTemplateColumns={GRID_COLUMNS}>
                {month.weeks.flatMap((week, weekIndex) =>
                  week.days.map((day, dayIndex) => (
                    <HabitCalendarCell key={`${weekIndex}-${dayIndex}`} day={day} />
                  )),
                )}
              </Box>
            </VStack>
          ))}
        </HStack>

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
      </VStack>
    </Box>
  )
}

function HabitCalendarCell({ day }: Readonly<{ day: HabitCalendarDay | null }>) {
  const { t } = useI18n()

  if (day === null || day.isFuture) {
    return <Box w={`${CELL_SIZE_PX}px`} h={`${CELL_SIZE_PX}px`} />
  }

  const style = LEVEL_STYLES[day.level]
  const detailText = t("habit.calendarDayValue", { value: day.value })

  return (
    <Box className="group" position="relative" lineHeight={0}>
      <chakra.button
        aria-label={`${formatCalendarDate(day.date)} — ${detailText}`}
        aspectRatio={1}
        bg={style.bg}
        border="none"
        borderRadius="2px"
        cursor="default"
        opacity={style.opacity}
        padding={0}
        type="button"
        w="full"
        {...focusRing}
      />
      <Box
        aria-hidden="true"
        position="absolute"
        bottom="100%"
        left="50%"
        lineHeight="normal"
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
              {formatCalendarDate(day.date)}
            </Text>
            <Text fontSize="xs" color="app.textMuted">
              {detailText}
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}
