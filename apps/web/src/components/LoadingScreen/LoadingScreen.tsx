import { Box } from "@chakra-ui/react"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"

export const LoadingScreen = () => (
  <Box
    data-testid="loading-screen"
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    width="100%"
  >
    <NotebookIcon animating ariaLabel="Loading" size={96} />
  </Box>
)
