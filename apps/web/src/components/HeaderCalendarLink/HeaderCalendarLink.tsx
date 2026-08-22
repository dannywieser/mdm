import { chakra, Tooltip } from "@chakra-ui/react"
import { CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"

const RouterLink = chakra(Link)

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"

export function HeaderCalendarLink() {
  const { t } = useI18n()

  return (
    <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <RouterLink
          to="/calendar"
          data-testid="header-calendar-link"
          aria-label={t("header.calendar")}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="1.5"
          borderRadius="md"
          color="app.text"
          _hover={{ bg: "app.panelBackgroundHover" }}
          transition="background 0.15s"
          {...focusRing}
        >
          <CalendarDays size={20} />
        </RouterLink>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{t("header.calendar")}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
