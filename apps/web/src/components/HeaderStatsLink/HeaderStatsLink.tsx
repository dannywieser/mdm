import { chakra, Tooltip } from "@chakra-ui/react"
import { BarChart2 } from "lucide-react"
import { Link } from "react-router-dom"

const RouterLink = chakra(Link)

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"

export function HeaderStatsLink() {
  const { t } = useI18n()

  return (
    <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <RouterLink
          to="/stats"
          data-testid="header-stats-link"
          aria-label={t("header.stats")}
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
          <BarChart2 size={20} />
        </RouterLink>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{t("header.stats")}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
