import { Box, Flex, Input, Text } from "@chakra-ui/react"
import { useRef } from "react"

import { useI18n } from "../../i18n"

import type { TerminalInputProps } from "./TerminalInput.types"

export function TerminalInput({ onSubmit }: TerminalInputProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    const value = inputRef.current?.value.trim() ?? ""
    onSubmit(value)
    if (inputRef.current) inputRef.current.value = ""
  }

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
          ref={inputRef}
          variant="flushed"
          placeholder={t("terminal.inputPlaceholder")}
          color="green.400"
          caretColor="green.400"
          _placeholder={{ color: "green.900" }}
          fontSize="sm"
          borderBottomWidth={0}
          onKeyDown={handleKeyDown}
        />
      </Flex>
    </Box>
  )
}
