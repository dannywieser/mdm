import { Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"

export function Header() {
  const title = " mdm"

  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      borderBottomColor="gray.200"
      borderBottomWidth="1px"
      position="sticky"
      px={4}
      py={1}
      top={0}
      zIndex="sticky"
      backgroundColor="black"
    >
      <Text fontSize="sm" fontWeight="semibold" color="white">
        {title}
      </Text>
      <Text fontSize="sm" color="white">
        {formatDate(new Date())}
      </Text>
    </Flex>
  )
}
