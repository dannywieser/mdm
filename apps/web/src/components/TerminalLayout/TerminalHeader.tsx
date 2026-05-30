import { Box, Text } from "@chakra-ui/react"
import { useI18n } from "../../i18n"

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
      <Text fontSize="xs" color="green.600">
        {t("terminal.appName")}
      </Text>
    </Box>
  )
}
