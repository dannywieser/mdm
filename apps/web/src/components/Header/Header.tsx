import { Box, Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"
import { X } from "lucide-react"
import { useLocation, useMatch, useNavigate } from "react-router-dom"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { HeaderBreadcrumb } from "../HeaderBreadcrumb"
import { HeaderShell } from "../HeaderShell"
import { HeaderStatsLink } from "../HeaderStatsLink"
import { HeaderPaletteSelector } from "../HeaderPaletteSelector"

export function HeaderSkeleton() {
  const { t } = useI18n()

  return (
    <HeaderShell
      left={
        <Text fontSize="sm" fontWeight="semibold" color="app.text">
          {t("app.name")}
        </Text>
      }
      right={null}
    />
  )
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isStatsPage = useMatch("/stats")
  const isColorsPage = useMatch("/colors")
  const isSecondaryPage = !!(isStatsPage ?? isColorsPage)

  return (
    <HeaderShell
      left={<HeaderBreadcrumb />}
      right={
        isSecondaryPage ? (
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
            {...focusRing}
            onClick={() => {
              if (location.key !== "default") void navigate(-1)
              else void navigate("/")
            }}
          >
            <X size={20} />
          </Box>
        ) : (
          <Flex alignItems="center" gap="1">
            <Text fontSize="sm" color="app.text" fontWeight="bold">
              {formatDate(new Date())}
            </Text>
            <HeaderStatsLink />
            <HeaderPaletteSelector />
          </Flex>
        )
      }
    />
  )
}
