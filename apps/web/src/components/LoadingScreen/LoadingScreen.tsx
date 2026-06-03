import { Box, VStack } from "@chakra-ui/react"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"

export const LoadingScreen = () => (
  <VStack data-testid="loading-screen" align="center" gap={6} pt={16}>
    <Box color="gray.300">
      <NotebookIcon animating={true} size={80} />
    </Box>
  </VStack>
)
