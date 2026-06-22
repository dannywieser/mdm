import {
  BreadcrumbCurrentLink,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbRoot,
  BreadcrumbSeparator,
} from "@chakra-ui/react"
import { Link, useMatch, useParams } from "react-router-dom"

import { useViewsQuery } from "services"
import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { resolveCurrentPageLabel } from "./HeaderBreadcrumb.util"

export function HeaderBreadcrumb() {
  const { t } = useI18n()
  const { view } = useParams<{ view?: string }>()
  const isStatsPage = useMatch("/stats")
  const isColorsPage = useMatch("/colors")
  const habitMatch = useMatch("/tracking/:habitId")
  const { data } = useViewsQuery({})
  const currentView = view ? data.views.find(({ id }) => id === view) : undefined

  const currentPageLabel = resolveCurrentPageLabel([
    { match: !!isStatsPage, label: t("header.stats") },
    { match: !!isColorsPage, label: t("header.colors") },
    { match: !!currentView, label: currentView?.name },
    { match: !!habitMatch, label: habitMatch?.params.habitId },
  ])

  if (!currentPageLabel) {
    return (
      <BreadcrumbRoot size="md">
        <BreadcrumbList display="flex" alignItems="center" listStyleType="none" gap={1}>
          <BreadcrumbItem>
            <BreadcrumbCurrentLink fontWeight="semibold" color="app.text">
              {t("app.name")}
            </BreadcrumbCurrentLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </BreadcrumbRoot>
    )
  }

  return (
    <BreadcrumbRoot size="md">
      <BreadcrumbList display="flex" alignItems="center" listStyleType="none" gap={1}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild fontWeight="semibold" color="app.text" {...focusRing}>
            <Link to="/">{t("app.name")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbCurrentLink color="app.textMuted">{currentPageLabel}</BreadcrumbCurrentLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}
