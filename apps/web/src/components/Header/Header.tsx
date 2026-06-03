import { Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"

import { usePageTitle } from "../../context/PageTitle/usePageTitle"

import { PaletteSelector } from "../PaletteSelector/PaletteSelector"

export function Header() {
  const appName = "mdm"
  const { title } = usePageTitle()

  return (
    <Flex
      as="header"
      alignItems="center"
      justifyContent="space-between"
      borderBottomColor="app.border"
      borderBottomWidth="1px"
      position="sticky"
      px={4}
      py={1}
      top={0}
      zIndex="sticky"
      backgroundColor="app.background"
    >
      <Flex alignItems="baseline" gap={2}>
        <Text fontSize="sm" fontWeight="semibold" color="app.text">
          {appName}
        </Text>
        {title && (
          <Text fontSize="sm" color="app.textMuted">
            &gt; {title}
          </Text>
        )}
      </Flex>
      <Flex alignItems="center" gap="2">
        <PaletteSelector />
        <Text fontSize="sm" color="app.text">
          {formatDate(new Date())}
        </Text>
      </Flex>
    </Flex>
  )
}
