import { Box } from "@chakra-ui/react"

import { NotebookIcon } from "../NotebookIcon/NotebookIcon"

import type { LoadingScreenProps } from "./LoadingScreen.types"

export const LoadingScreen = (_props: LoadingScreenProps) => (
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
