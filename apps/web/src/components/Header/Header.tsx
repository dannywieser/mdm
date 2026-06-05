import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot,
  Flex,
  Text,
} from "@chakra-ui/react"
import { formatDate } from "mdm-util"
import { Link, useParams } from "react-router-dom"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"

import { PaletteSelector } from "../PaletteSelector/PaletteSelector"

export function Header() {
  const { view } = useParams<{ view?: string }>()
  const { data } = useStatsQuery({})
  const currentView = view ? data.views.find(({ id }) => id === view) : undefined

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
      <BreadcrumbRoot size="sm">
        {currentView ? (
          <>
            <BreadcrumbLink asChild fontWeight="semibold" color="app.text">
              <Link to="/">mdm</Link>
            </BreadcrumbLink>
            <BreadcrumbCurrentLink color="app.textMuted">
              {currentView.name}
            </BreadcrumbCurrentLink>
          </>
        ) : (
          <BreadcrumbCurrentLink fontWeight="semibold" color="app.text">
            mdm
          </BreadcrumbCurrentLink>
        )}
      </BreadcrumbRoot>
      <Flex alignItems="center" gap="2">
        <PaletteSelector />
        <Text fontSize="sm" color="app.text">
          {formatDate(new Date())}
        </Text>
      </Flex>
    </Flex>
  )
}
