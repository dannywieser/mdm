import { Box, Flex, Text } from "@chakra-ui/react"
import { useI18n } from "../../i18n"
import { TerminalHeader } from "./TerminalHeader"
import { TerminalInput } from "./TerminalInput"

export function TerminalLayout() {
  const { t } = useI18n()

  return (
    <Flex
      direction="column"
      height="100vh"
      bg="black"
      color="green.400"
      fontFamily="mono"
    >
      <TerminalHeader />

      <Box flex={1} overflowY="auto" p={4}>
        <Text>{t("terminal.ready")}</Text>
      </Box>

      <TerminalInput />
    </Flex>
  )
}
