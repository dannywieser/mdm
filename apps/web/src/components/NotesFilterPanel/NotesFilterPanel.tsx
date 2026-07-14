import { Drawer, IconButton, VStack } from "@chakra-ui/react"
import { X } from "lucide-react"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { NotesFilterFacetGroup } from "../NotesFilterFacetGroup"
import {
  buildFrontmatterParamKey,
  YEAR_PARAM_KEY,
} from "../NotesFilterFacetGroup/NotesFilterFacetGroup.util"
import { NotesSearchInput } from "../NotesSearchInput"

import type { NotesFilterPanelProps } from "./NotesFilterPanel.types"

export const NotesFilterPanel = ({
  frontmatterFacets,
  isOpen,
  onClose,
  yearOptions,
}: NotesFilterPanelProps) => {
  const { t } = useI18n()

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(details) => { if (!details.open) onClose(); }}
      placement="start"
      size={{ base: "full", md: "sm" }}
    >
      <Drawer.Positioner>
        <Drawer.Content bg="app.background" color="app.text">
          <Drawer.Header>
            <Drawer.Title>{t("gallery.filters")}</Drawer.Title>
            <Drawer.CloseTrigger asChild>
              <IconButton
                aria-label={t("gallery.closeFilters")}
                variant="ghost"
                color="app.text"
                _hover={{ bg: "app.panelBackgroundHover" }}
                {...focusRing}
              >
                <X size={16} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body>
            <VStack align="stretch" gap="5">
              <NotesSearchInput />
              <NotesFilterFacetGroup
                label={t("gallery.year")}
                options={yearOptions.map(String)}
                paramKey={YEAR_PARAM_KEY}
              />
              {frontmatterFacets.map((facet) => (
                <NotesFilterFacetGroup
                  key={facet.key}
                  label={facet.key}
                  options={facet.values}
                  paramKey={buildFrontmatterParamKey(facet.key)}
                />
              ))}
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
