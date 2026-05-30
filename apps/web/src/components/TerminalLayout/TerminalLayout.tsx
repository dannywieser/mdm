import { Box, Flex } from "@chakra-ui/react"
import { useState } from "react"

import { TerminalContent } from "./TerminalContent"
import { TerminalHeader } from "./TerminalHeader"
import { TerminalInput } from "./TerminalInput"

export function TerminalLayout() {
  const [command, setCommand] = useState<string | null>(null)

  const handleSubmit = (input: string) => {
    if (!input) return
    if (input === "clear") {
      setCommand(null)
      return
    }
    setCommand(input)
  }

  return (
    <Flex
      direction="column"
      height="100vh"
      bg="black"
      color="green.400"
      fontFamily="mono"
    >
      <TerminalHeader />

      <Box
        flex={1}
        overflowY="auto"
        p={4}
        height="100%"
        css={{
          scrollbarColor: "var(--chakra-colors-green-900) black",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "black" },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--chakra-colors-green-900)",
            borderRadius: "3px",
          },
        }}
      >
        <TerminalContent command={command} />
      </Box>

      <TerminalInput onSubmit={handleSubmit} />
    </Flex>
  )
}
