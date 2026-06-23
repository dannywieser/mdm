import { Box, Flex, Text } from "@chakra-ui/react"
import { formatDate } from "mdm-util"
import { X } from "lucide-react"
import { useLocation, useMatch, useNavigate, useParams } from "react-router-dom"

import { useViewsQuery } from "services"
import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { HeaderBreadcrumb } from "../HeaderBreadcrumb"
import { HeaderShell } from "../HeaderShell"
import { HeaderStatsLink } from "../HeaderStatsLink"
import { NotesSearchInput } from "../NotesSearchInput"
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
  const { view } = useParams<{ view?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const isStatsPage = useMatch("/stats")
  const isColorsPage = useMatch("/colors")
  const { data } = useViewsQuery({})
  const currentView = view
    ? data.views.find(({ id }) => id === view)
    : undefined
  const showNotesSearch = currentView?.component === "NotesGallery"
  const isSecondaryPage = !!(isStatsPage ?? isColorsPage)

  return (
    <HeaderShell
      center={showNotesSearch ? <NotesSearchInput /> : null}
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
              {formatDate(new Date(), "yyyy.MM.dd (EEE)")}
            </Text>
            <HeaderStatsLink />
            <HeaderPaletteSelector />
          </Flex>
        )
      }
    />
  )
}
