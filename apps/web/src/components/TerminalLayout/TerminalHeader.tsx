import { Box, Flex, Text } from "@chakra-ui/react"
import { useI18n } from "../../i18n"

const formatHeaderDate = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const day = date.toLocaleDateString("en", { weekday: "short" })
  return `${yyyy}.${mm}.${dd} (${day})`
}

export function TerminalHeader() {
  const { t } = useI18n()

  return (
    <Box
      px={4}
      py={1}
      borderBottom="1px solid"
      borderColor="green.900"
      bg="gray.950"
      flexShrink={0}
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color="green.600">
          {t("terminal.appName")}
        </Text>
        <Text fontSize="xs" color="green.600">
          {formatHeaderDate(new Date())}
        </Text>
      </Flex>
    </Box>
  )
}
