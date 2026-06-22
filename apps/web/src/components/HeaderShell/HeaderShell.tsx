import { Box, Flex } from "@chakra-ui/react"

import { type HeaderShellProps } from "./HeaderShell.types"

export function HeaderShell({ left, center, right }: Readonly<HeaderShellProps>) {
  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      flexWrap={{ base: "wrap", md: "nowrap" }}
      borderBottomColor="app.border"
      borderBottomWidth="1px"
      position="sticky"
      px={2}
      py={1}
      minH="42px"
      top={0}
      zIndex="sticky"
      backgroundColor="app.background"
    >
      <Flex order={1} alignItems="center">
        {left}
      </Flex>
      {center && (
        <Box order={{ base: 3, md: 2 }} flexBasis={{ base: "100%", md: "auto" }} flex={{ md: "1" }}>
          {center}
        </Box>
      )}
      <Flex order={{ base: 2, md: 3 }} alignItems="center">
        {right}
      </Flex>
    </Flex>
  )
}
