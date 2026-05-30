import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { Notebook } from "lucide-react"

import { NotesList } from "../NotesList"

interface TerminalContentProps {
  command: string | null
}

const HELP_TEXT = [
  { cmd: "otd", desc: "show notes matching today's date" },
  { cmd: "clear", desc: "clear the terminal" },
  { cmd: "help", desc: "list available commands" },
]

export function TerminalContent({ command }: TerminalContentProps) {
  if (command === null) {
    return (
      <Flex height="100%" align="center" justify="center">
        <Notebook size={120} color="var(--chakra-colors-green-900)" />
      </Flex>
    )
  }

  if (command === "help") {
    return (
      <VStack align="stretch" gap={1} fontFamily="mono" fontSize="sm">
        {HELP_TEXT.map(({ cmd, desc }) => (
          <Box key={cmd}>
            <Text as="span" color="green.300">
              {cmd}
            </Text>
            <Text as="span" color="green.700">
              {" "}
              — {desc}
            </Text>
          </Box>
        ))}
      </VStack>
    )
  }

  if (command === "otd") {
    return <NotesList />
  }

  return (
    <Text color="green.700" fontSize="sm" fontFamily="mono">
      unknown command: {command}. Type{" "}
      <Text as="span" color="green.400">
        help
      </Text>{" "}
      for available commands.
    </Text>
  )
}
