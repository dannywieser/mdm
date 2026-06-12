import { IconButton } from "@chakra-ui/react"
import { Book, BookCheck } from "lucide-react"

import { useToggleRead } from "services"
import { useI18n } from "../../i18n"

import type { ToggleReadButtonProps } from "./ToggleReadButton.types"

export const ToggleReadButton = ({
  isRead,
  noteId,
}: ToggleReadButtonProps) => {
  const { t } = useI18n()
  const toggleRead = useToggleRead({ noteId })
  const toggleLabel = isRead ? t("notes.markAsUnread") : t("notes.markAsRead")

  return (
    <IconButton
      aria-label={toggleLabel}
      title={toggleLabel}
      size="sm"
      variant="ghost"
      bg={isRead ? "app.successBackground" : "app.panelBackground"}
      color={isRead ? "app.successText" : "app.textMuted"}
      _hover={{
        bg: isRead ? "app.successHoverBackground" : "app.panelBackgroundHover",
      }}
      onClick={() => toggleRead.mutate()}
      loading={toggleRead.isPending}
    >
      {isRead ? <BookCheck size={16} /> : <Book size={16} />}
    </IconButton>
  )
}
