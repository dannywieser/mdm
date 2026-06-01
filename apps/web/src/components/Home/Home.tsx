import { Box, Center } from '@chakra-ui/react'
import { Notebook } from 'lucide-react'

export function Home() {
  return (
    <Center h="100vh">
      <Box color="gray.300">
        <Notebook color="currentColor" size={80} />
      </Box>
    </Center>
  )
}
