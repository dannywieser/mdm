import { Box, Flex } from "@chakra-ui/react"
import { NotesList } from "../"
import { TerminalHeader } from "./TerminalHeader"
import { TerminalInput } from "./TerminalInput"

export function TerminalLayout() {
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
        css={{
          scrollbarColor: 'var(--chakra-colors-green-900) black',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'black' },
          '&::-webkit-scrollbar-thumb': { background: 'var(--chakra-colors-green-900)', borderRadius: '3px' },
        }}
      >
        <NotesList />
      </Box>

      <TerminalInput />
    </Flex>
  )
}
