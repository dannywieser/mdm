import { Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"

import type { HeaderProps } from "./Header.types"

export function Header(_props: HeaderProps) {
  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      borderBottomColor="gray.200"
      borderBottomWidth="1px"
      left={0}
      position="absolute"
      px={4}
      py={1}
      right={0}
      top={0}
    >
      <Text fontSize="sm" fontWeight="semibold">
        mdm
      </Text>
      <Text fontSize="sm">{formatDate(new Date())}</Text>
    </Flex>
  )
}
