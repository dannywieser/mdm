import { Box, Center, Text, VStack } from "@chakra-ui/react"

import { useStatsQuery } from "../../hooks/useStatsQuery"
import { NotebookIcon } from "../NotebookIcon/NotebookIcon"

export function Home() {
  const { data, isLoading } = useStatsQuery()

  return (
    <Box h="100vh" position="relative">
      <Center h="100vh">
        <Box color="gray.300">
          <NotebookIcon animating={isLoading} size={80} />
        </Box>
      </Center>
      {data && (
        <VStack
          color="fg.muted"
          gap={1}
          left="50%"
          position="absolute"
          style={{ transform: "translateX(-50%)" }}
          textAlign="center"
          top="calc(50% + 64px)"
        >
          <Text fontSize="sm">{data.totalNotes} notes</Text>
          <Text fontSize="sm">{data.modifiedToday} modified today</Text>
          {data.views.map((view) => (
            <Text fontSize="sm" key={view.name}>
              {view.count} {view.name}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  )
}
