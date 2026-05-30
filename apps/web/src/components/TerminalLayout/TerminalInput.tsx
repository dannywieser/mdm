import { Box, Flex, Input, Text } from "@chakra-ui/react"
import { useI18n } from "../../i18n"

export function TerminalInput() {
  const { t } = useI18n()

  return (
    <Box
      px={4}
      py={2}
      borderTop="1px solid"
      borderColor="green.900"
      flexShrink={0}
    >
      <Flex align="center" gap={2}>
        <Text color="green.600" flexShrink={0}>
          &gt;
        </Text>
        <Input
          variant="flushed"
          placeholder={t("terminal.inputPlaceholder")}
          color="green.400"
          caretColor="green.400"
          _placeholder={{ color: "green.900" }}
          fontSize="sm"
        />
      </Flex>
    </Box>
  )
}
