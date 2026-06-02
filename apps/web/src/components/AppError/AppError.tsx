import { Box, Text, VStack } from "@chakra-ui/react"
import { Bug } from "lucide-react"

import type { AppErrorProps } from "./AppError.types"

export function AppError({ message }: AppErrorProps) {
  return (
    <VStack align="center" gap={6} pt={16}>
      <Box color="gray.300">
        <Bug size={80} />
      </Box>
      <Text color="fg.muted" fontSize="sm">
        {message}
      </Text>
    </VStack>
  )
}
