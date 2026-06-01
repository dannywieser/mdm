import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { Notebook } from 'lucide-react'

import { useStatsQuery } from '../../hooks/useStatsQuery'

export function Home() {
  const { data, isLoading } = useStatsQuery()

  return (
    <Center h="100vh">
      <VStack gap={6}>
        <Box color="gray.300">
          <Notebook color="currentColor" size={80} />
        </Box>
        {isLoading ? (
          <Spinner color="gray.300" size="sm" />
        ) : data ? (
          <VStack color="fg.muted" gap={1}>
            <Text fontSize="sm">{data.totalNotes} notes</Text>
            <Text fontSize="sm">{data.modifiedToday} modified today</Text>
            {data.views.map((view) => (
              <Text fontSize="sm" key={view.name}>
                {view.count} {view.name}
              </Text>
            ))}
          </VStack>
        ) : null}
      </VStack>
    </Center>
  )
}
