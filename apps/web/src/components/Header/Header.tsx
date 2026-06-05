import {
  BreadcrumbCurrentLink,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbRoot,
  BreadcrumbSeparator,
  Flex,
  Text,
} from "@chakra-ui/react"
import { formatDate } from "mdm-util"
import { type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"
import { useI18n } from "../../i18n"

import { PaletteSelector } from "../PaletteSelector/PaletteSelector"

function HeaderShell({ left, right }: { left: ReactNode; right: ReactNode }) {
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
      {left}
      {right}
    </Flex>
  )
}

export function HeaderSkeleton() {
  const { t } = useI18n()

  return (
    <HeaderShell
      left={
        <Text fontSize="sm" fontWeight="semibold" color="app.text">
          {t("app.name")}
        </Text>
      }
      right={
        <Text fontSize="sm" color="app.text" fontWeight="bold">
          {formatDate(new Date())}
        </Text>
      }
    />
  )
}

export function Header() {
  const { t } = useI18n()
  const { view } = useParams<{ view?: string }>()
  const { data } = useStatsQuery({})
  const currentView = view
    ? data.views.find(({ id }) => id === view)
    : undefined

  return (
    <HeaderShell
      left={
        <BreadcrumbRoot size="md">
          <BreadcrumbList
            display="flex"
            alignItems="center"
            listStyleType="none"
            gap={1}
          >
            {currentView ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild fontWeight="semibold" color="app.text">
                    <Link to="/">{t("app.name")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbCurrentLink color="app.textMuted">
                    {currentView.name}
                  </BreadcrumbCurrentLink>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbCurrentLink fontWeight="semibold" color="app.text">
                  {t("app.name")}
                </BreadcrumbCurrentLink>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </BreadcrumbRoot>
      }
      right={
        <Flex alignItems="center" gap="2">
          <Text fontSize="sm" color="app.text" fontWeight="bold">
            {formatDate(new Date())}
          </Text>
          <PaletteSelector />
        </Flex>
      }
    />
  )
}
