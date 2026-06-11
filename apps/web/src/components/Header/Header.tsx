import {
  Box,
  BreadcrumbCurrentLink,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbRoot,
  BreadcrumbSeparator,
  chakra,
  Flex,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { formatDate } from "mdm-util"
import { type ReactNode } from "react"
import { Link, useLocation, useMatch, useNavigate, useParams } from "react-router-dom"

const RouterLink = chakra(Link)
import { BarChart2, X } from "lucide-react"

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
      minH="32px"
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
  const location = useLocation()
  const navigate = useNavigate()
  const isStatsPage = useMatch("/stats")
  const isColorsPage = useMatch("/colors")
  const habitMatch = useMatch("/tracking/:habitId")
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
            {isStatsPage ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild fontWeight="semibold" color="app.text">
                    <Link to="/">{t("app.name")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbCurrentLink color="app.textMuted">
                    {t("header.stats")}
                  </BreadcrumbCurrentLink>
                </BreadcrumbItem>
              </>
            ) : isColorsPage ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild fontWeight="semibold" color="app.text">
                    <Link to="/">{t("app.name")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbCurrentLink color="app.textMuted">
                    colors
                  </BreadcrumbCurrentLink>
                </BreadcrumbItem>
              </>
            ) : currentView ? (
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
            ) : habitMatch ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild fontWeight="semibold" color="app.text">
                    <Link to="/">{t("app.name")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbCurrentLink color="app.textMuted">
                    {habitMatch.params.habitId}
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
        isStatsPage || isColorsPage ? (
          <Box
            as="button"
            aria-label="Close"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="1.5"
            borderRadius="md"
            color="app.textMuted"
            cursor="pointer"
            _hover={{ bg: "app.panelBackgroundHover", color: "app.text" }}
            transition="background 0.15s, color 0.15s"
            onClick={() =>
              location.key !== "default" ? navigate(-1) : navigate("/")
            }
          >
            <X size={20} />
          </Box>
        ) : (
          <Flex alignItems="center" gap="1">
            <Text fontSize="sm" color="app.text" fontWeight="bold">
              {formatDate(new Date())}
            </Text>
            <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
              <Tooltip.Trigger asChild>
                <RouterLink
                  to="/stats"
                  aria-label="Stats"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  p="1.5"
                  borderRadius="md"
                  color="app.text"
                  _hover={{ bg: "app.panelBackgroundHover" }}
                  transition="background 0.15s"
                >
                  <BarChart2 size={20} />
                </RouterLink>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>{t("header.stats")}</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
            <PaletteSelector />
          </Flex>
        )
      }
    />
  )
}
