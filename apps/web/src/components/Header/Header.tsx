import { Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"

import { usePageTitle } from "../../context/PageTitle/PageTitle"

export function Header() {
  const appName = "mdm"
  const { title } = usePageTitle()

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
      <Flex alignItems="baseline" gap={2}>
        <Text fontSize="sm" fontWeight="semibold" color="white">
          {appName}
        </Text>
        {title && (
          <Text fontSize="sm" color="gray.400">
            &gt; {title}
          </Text>
        )}
      </Flex>
      <Text fontSize="sm" color="white">
        {formatDate(new Date())}
      </Text>
    </Flex>
  )
}
