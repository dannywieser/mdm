import { Box, Text, VStack } from "@chakra-ui/react"
import { Bug } from "lucide-react"

import type { AppErrorProps } from "./AppError.types"

export function AppError({ message }: AppErrorProps) {
  return (
    <VStack align="center" gap={6} pt={16}>
      <Box color="app.iconMuted">
        <Bug size={80} />
      </Box>
      <Text color="app.textMuted" fontSize="sm">
        {message}
      </Text>
    </VStack>
  )
}
